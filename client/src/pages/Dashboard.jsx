import { useState, useEffect } from 'react'
import PlayerCard from '../Components/PlayerCard'
import TournamentCard from '../Components/TournamentCard'
import CourseCard from '../Components/CourseCard'
import PlayerPointsChart from '../Components/PlayerPointsChart'

const MOCK_TOURNAMENTS = [
    { id: 1, name: 'The Masters', status: 'Finished' },
    { id: 2, name: 'PGA Championship', status: 'Upcoming' },
    { id: 3, name: 'U.S. Open', status: 'Upcoming' },
    { id: 4, name: 'The Open Championship', status: 'Upcoming' },
    { id: 5, name: 'THE PLAYERS', status: 'Finished' }
];

export default function Dashboard({ user, goToProfile }) {
    const [searchMode, setSearchMode] = useState('player');   // player | tournament | course
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [players, setPlayers] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [courses, setCourses] = useState([]);               // Store course search results
    const [preloadedCourses, setPreloadedCourses] = useState([]); // Store initial ~100 courses

    // Fetch players on load
    useEffect(() => {
        fetch('http://localhost:3000/players')
            .then(res => res.json())
            .then(data => setPlayers(data))
            .catch(err => console.error("Failed to fetch players:", err));
    }, []);

    // Fetch tournaments on load
    useEffect(() => {
        fetch('http://localhost:3000/tournaments')
            .then(res => res.json())
            .then(data => {
                const now = new Date();
                const processed = data.map(t => {
                    const start = new Date(t.start_date);
                    const end = new Date(t.end_date);
                    let status = 'Upcoming';
                    if (now > end) status = 'Finished';
                    else if (now >= start && now <= end) status = 'Live';

                    return { ...t, status };
                });
                setTournaments(processed);
            })
            .catch(err => console.error("Failed to fetch tournaments:", err));
    }, []);

    // Fetch initial courses on load
    useEffect(() => {
        fetch('http://localhost:3000/api/golf/courses')
            .then(res => res.json())
            .then(data => {
                if (data.courses) {
                    const normalized = data.courses.map(c => ({
                        id: c.id,
                        name: c.club_name || c.course_name || "Unknown Course",
                        city: c.location?.city,
                        state: c.location?.state,
                        country: c.location?.country,
                        address: c.location?.address,
                        tees: c.tees
                    }));
                    setPreloadedCourses(normalized);
                }
            })
            .catch(err => console.error("Failed to fetch initial courses:", err));
    }, []);

    // --- Fetch Golf Courses when typing ---
    useEffect(() => {
        if (searchMode !== 'course') return;

        if (searchQuery.trim().length < 2) {
            setCourses(preloadedCourses);
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            fetch(`http://localhost:3000/api/golf/search?query=${encodeURIComponent(searchQuery)}`, {
                signal: controller.signal
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Courses fetched:", data);

                    if (!data.courses) {
                        setCourses([]);
                        return;
                    }

                    // ⭐ NORMALIZE COURSE SHAPE ⭐
                    const normalized = data.courses.map(c => ({
                        id: c.id,
                        name: c.club_name || c.course_name || "Unknown Course",
                        city: c.location?.city,
                        state: c.location?.state,
                        country: c.location?.country,
                        address: c.location?.address,
                        tees: c.tees
                    }));

                    setCourses(normalized);
                })
                .catch(err => {
                    if (err.name !== "AbortError") console.error("Course search failed:", err);
                });
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };

    }, [searchMode, searchQuery, preloadedCourses]);

    // Choose which dataset to search
    const data =
        searchMode === 'player'
            ? players
            : searchMode === 'tournament'
                ? tournaments
                : courses;

    // This now works for courses because `item.name` exists
    const filteredData = data.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleModeChange = (mode) => {
        setSearchMode(mode);
        setSelectedItem(null);
        setSearchQuery('');
        if (mode === 'course') {
            setCourses(preloadedCourses);
        } else {
            setCourses([]);
        }
    };

    return (
        <>
            <div id='menu-wrapper'>
                <div className="menu-bar">
                    <span className="menu-title" onClick={goToProfile} style={{ cursor: 'pointer' }}>
                        PGA Performance Analyser
                    </span>
                    <img src="/profile.png" className="profile-icon" onClick={goToProfile} />
                </div>

                <div id='content' className="dashboard-content">
                    <div className="search-section">

                        {/* Search Mode Buttons */}
                        <div className="search-toggles">
                            <button
                                className={`toggle-btn ${searchMode === 'player' ? 'active' : ''}`}
                                onClick={() => handleModeChange('player')}
                            >
                                PLAYERS
                            </button>

                            <button
                                className={`toggle-btn ${searchMode === 'tournament' ? 'active' : ''}`}
                                onClick={() => handleModeChange('tournament')}
                            >
                                TOURNAMENTS
                            </button>

                            <button
                                className={`toggle-btn ${searchMode === 'course' ? 'active' : ''}`}
                                onClick={() => handleModeChange('course')}
                            >
                                COURSES
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder={
                                searchMode === 'player'
                                    ? "SEARCH FOR PLAYERS"
                                    : searchMode === 'tournament'
                                        ? "SEARCH FOR TOURNAMENTS"
                                        : "SEARCH FOR GOLF COURSES"
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />

                        {/* Dynamic Results */}
                        <div className="search-results">
                            {filteredData.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    className={`result-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <span
                                        className="result-name"
                                        style={{ borderRight: searchMode === 'player' ? 'none' : undefined }}
                                    >
                                        {item.name?.toUpperCase()}
                                    </span>

                                    {searchMode !== 'player' && (
                                        <span className="result-rank">
                                            {
                                                searchMode === 'tournament'
                                                    ? item.status
                                                    : item.city || ""
                                            }
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="vertical-divider"></div>

                    <div className="details-section">
                        {searchMode === 'player' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
                                <PlayerPointsChart players={players} />
                                <PlayerCard player={selectedItem} />
                            </div>
                        )}
                        {searchMode === 'tournament' && <TournamentCard tournament={selectedItem} />}
                        {searchMode === 'course' && <CourseCard course={selectedItem} />}
                    </div>
                </div>
            </div>
        </>
    );
}