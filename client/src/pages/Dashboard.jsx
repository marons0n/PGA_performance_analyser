import { useState } from 'react'
import PlayerCard from '../Components/PlayerCard'
import TournamentCard from '../Components/TournamentCard'

const MOCK_PLAYERS = [
    { id: 1, name: 'Scottie Scheffler', rank: 'No. 1' },
    { id: 2, name: 'Rory McIlroy', rank: 'No. 3' },
    { id: 3, name: 'Jon Rahm', rank: '--' },
    { id: 4, name: 'Viktor Hovland', rank: 'No. 2' },
    { id: 5, name: 'Patrick Cantlay', rank: 'No. 5' },
    { id: 6, name: 'Tiger Woods', rank: '--' },
    { id: 7, name: 'Xander Schauffele', rank: 'No. 10' },
    { id: 8, name: 'Patrick Cantlay', rank: 'No. 7' },
    { id: 9, name: 'Max Homa', rank: '--' },
    { id: 10, name: 'Matt Fitzpatrick', rank: 'No. 4' },
    { id: 11, name: 'Jordan Spieth', rank: 'No. 15' },
    { id: 12, name: 'Cameron Smith', rank: '--' },
    { id: 13, name: 'Justin Thomas', rank: 'No. 6' },
    { id: 14, name: 'Collin Morikawa', rank: 'No. 8' },
    { id: 15, name: 'Will Zalatoris', rank: '--' },
    { id: 16, name: 'Tony Finau', rank: 'No. 9' },
    { id: 17, name: 'Sam Burns', rank: 'No. 12' },
    { id: 18, name: 'Tyrrell Hatton', rank: '--' },
    { id: 19, name: 'Jason Day', rank: 'No. 11' },
    { id: 20, name: 'Rickie Fowler', rank: 'No. 13' },
    

]

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

    const data = searchMode === 'player' ? MOCK_PLAYERS : MOCK_TOURNAMENTS
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