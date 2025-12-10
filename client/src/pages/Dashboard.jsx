import { useState, useEffect } from 'react'
import PlayerCard from '../Components/PlayerCard'
import TournamentCard from '../Components/TournamentCard'
import CourseCard from '../Components/CourseCard'
import TournamentPurseChart from '../Components/TournamentPurseChart'
import PlayerComparison from '../Components/PlayerComparison'

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
    const [comparisonPlayer, setComparisonPlayer] = useState(null); // The second player for comparison
    const [isSelectingOpponent, setIsSelectingOpponent] = useState(false); // Mode to select the second player

    const [players, setPlayers] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [courses, setCourses] = useState([]);               // Store course search results
    const [preloadedCourses, setPreloadedCourses] = useState([]); // Store initial ~100 courses
    const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
    const [flaggedIds, setFlaggedIds] = useState([]);

    // Fetch players on load
    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = () => {
        fetch('http://localhost:3000/players')
            .then(res => res.json())
            .then(data => {
                const formatted = data.map(p => ({
                    ...p,
                    name: `${p.firstName} ${p.lastName}`
                }));
                setPlayers(formatted);
            })
            .catch(err => console.error("Failed to fetch players:", err));
    };

    const handleUpdatePlayers = () => {
        fetch('http://localhost:3000/players/update')
            .then(res => res.json())
            .then(() => {
                fetchPlayers();
            })
            .catch(err => console.error("Failed to update players:", err));
    };

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
    let filteredData = [];

    if (searchMode === "course") {
        // Start with master list
        filteredData = [...preloadedCourses];

        // Flag filter
        if (showFlaggedOnly) {
            filteredData = filteredData.filter(c =>
                flaggedIds.includes(String(c.id))
            );
        }

        // Search filter
        if (searchQuery.trim() !== "") {
            filteredData = filteredData.filter(c =>
                c.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    }
    else if (searchMode === "player") {
        filteredData = players.filter(p =>
            p.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    else if (searchMode === "tournament") {
        filteredData = tournaments.filter(t =>
            t.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

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

    const handleCompareClick = (player) => {
        setIsSelectingOpponent(true);
        setSearchQuery(''); // Clear search to show full list or let user search
    };


    const handleCloseComparison = () => {
        setComparisonPlayer(null);
        setIsSelectingOpponent(false);
    };

    const handlePlayerSelect = (item) => {
        // If we are in "select opponent" mode
        if (isSelectingOpponent && searchMode === 'player') {
            fetch(`http://localhost:3000/players/${item.id}/details`)
                .then(res => res.json())
                .then(details => {
                    const fullDetails = { ...item, ...details };
                    setComparisonPlayer(fullDetails);
                    setIsSelectingOpponent(false); // Done selecting
                })
                .catch(err => console.error("Failed to fetch details:", err));
            return;
        }

        // Normal selection
        setSelectedItem(item);
        if (searchMode === 'player') {
            fetch(`http://localhost:3000/players/${item.id}/details`)
                .then(res => res.json())
                .then(details => {
                    setSelectedItem(prev => ({ ...prev, ...details }));
                })
                .catch(err => console.error("Failed to fetch details:", err));
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

                            {searchMode === 'player' && (
                                <button
                                    className="update-btn"
                                    onClick={handleUpdatePlayers}
                                    title="Update Player Rankings"
                                >
                                    ↻
                                </button>
                            )}
                        </div>

                        <input
                            type="text"
                            placeholder={
                                isSelectingOpponent
                                    ? "SELECT OPPONENT..."
                                    : searchMode === 'player'
                                        ? "SEARCH FOR PLAYERS"
                                        : searchMode === 'tournament'
                                            ? "SEARCH FOR TOURNAMENTS"
                                            : "SEARCH FOR GOLF COURSES"
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                            style={isSelectingOpponent ? { borderColor: '#003366', borderWidth: '2px' } : {}}
                        />

                        {searchMode === "course" && (
                            <button
                                className="toggle-btn"
                                style={{
                                    backgroundColor: showFlaggedOnly ? "#1a5d1a" : "#eee",
                                    color: showFlaggedOnly ? "white" : "black",
                                    marginTop: "8px",
                                    padding: "5px"
                                }}
                                onClick={() => {
                                    if (!user) return alert("Login required");

                                    const newState = !showFlaggedOnly;
                                    setShowFlaggedOnly(newState);

                                    // Fetch flagged IDs once when turning ON
                                    if (newState) {
                                        fetch(`http://localhost:3000/api/golf/courses/flagged/${user.id}`)
                                            .then(res => res.json())
                                            .then(data =>
                                                setFlaggedIds((data.flagged || []).map(id => String(id)))
                                            );
                                    }
                                }}
                            >
                                {showFlaggedOnly ? "SHOW ALL COURSES" : "SHOW FLAGGED ONLY"}
                            </button>
                        )}
                        {/* Dynamic Results */}
                        <div
                            className="search-results"
                            style={
                                searchMode === "course"
                                    ? {
                                        minHeight: "500px",
                                        maxHeight: "500px",
                                        overflowY: "auto",
                                    }
                                    : {}
                            }
                        >


                            {filteredData.length === 0 && (
                                <div
                                    style={{
                                        padding: "20px",
                                        textAlign: "center",
                                        color: "white",
                                        fontSize: "18px"
                                    }}
                                >
                                    No flagged courses found
                                </div>
                            )}

                            {filteredData.length > 0 &&
                                filteredData.map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        className={`result-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                        onClick={() => handlePlayerSelect(item)}
                                    >
                                        <span className="result-name">{item.name?.toUpperCase()}</span>

                                        {searchMode !== 'player' && (
                                            <span className="result-rank">
                                                {searchMode === 'tournament' ? item.status : item.city || ""}
                                            </span>
                                        )}
                                    </div>
                                ))
                            }

                        </div>


                    </div>

                    <div className="vertical-divider"></div>

                    <div className="details-section">
                        {searchMode === 'player' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
                                {comparisonPlayer ? (
                                    <PlayerComparison
                                        player1={selectedItem}
                                        player2={comparisonPlayer}
                                        onClose={handleCloseComparison}
                                    />
                                ) : (
                                    <>
                                        <PlayerCard
                                            player={selectedItem}
                                            onCompare={handleCompareClick}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                        {searchMode === 'tournament' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
                                <TournamentPurseChart />
                                <TournamentCard tournament={selectedItem} />
                            </div>
                        )}
                        {searchMode === 'course' && <CourseCard course={selectedItem} user={user} />}
                    </div>
                </div>
            </div>
        </>
    );
}