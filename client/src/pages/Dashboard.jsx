import { useState, useEffect } from 'react'
import PlayerCard from '../Components/PlayerCard'
import TournamentCard from '../Components/TournamentCard'

const MOCK_TOURNAMENTS = [
    { id: 1, name: 'The Masters', status: 'Finished' },
    { id: 2, name: 'PGA Championship', status: 'Upcoming' },
    { id: 3, name: 'U.S. Open', status: 'Upcoming' },
    { id: 4, name: 'The Open Championship', status: 'Upcoming' },
    { id: 5, name: 'THE PLAYERS', status: 'Finished' }
]

export default function Dashboard({ user, goToProfile }) {
    const [searchMode, setSearchMode] = useState('player') // 'player' or 'tournament'
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [players, setPlayers] = useState([])

    useEffect(() => {
        fetch('http://localhost:3000/players')
            .then(res => res.json())
            .then(data => setPlayers(data))
            .catch(err => console.error("Failed to fetch players:", err))
    }, [])

    const data = searchMode === 'player' ? players : MOCK_TOURNAMENTS
    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleModeChange = (mode) => {
        setSearchMode(mode)
        setSelectedItem(null)
        setSearchQuery('')
    }

    return (<>
        <div id='menu-wrapper'>
            <div className="menu-bar">
                <span className="menu-title" onClick={goToProfile} style={{ cursor: 'pointer' }}>PGA Performance Analyser</span>
                <img src="/profile.png" className="profile-icon" onClick={goToProfile} />
            </div>
            <div id='content' className="dashboard-content">
                <div className="search-section">
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
                    </div>

                    <input
                        type="text"
                        placeholder="SEARCH FOR PLAYERS"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />

                    <div className="search-results">
                        {filteredData.map(item => (
                            <div
                                key={item.id}
                                className={`result-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                                onClick={() => setSelectedItem(item)}
                            >
                                <span className="result-name">{item.name.toUpperCase()}</span>
                                <span className="result-rank">{searchMode === 'player' ? item.rank : item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="vertical-divider"></div>

                <div className="details-section">
                    {searchMode === 'player' ?
                        <PlayerCard player={selectedItem} /> :
                        <TournamentCard tournament={selectedItem} />
                    }
                </div>
            </div>
        </div>
    </>)
}