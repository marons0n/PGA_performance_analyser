export default function PlayerCard({ player }) {
    if (!player) return null

    const names = player.name.split(' ')
    const firstName = names[0]
    const lastName = names.slice(1).join(' ')

    return (
        <div className="player-card">
            <div className="player-image-placeholder">
                <svg viewBox="0 0 24 24" fill="black" className="player-icon-svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            </div>
            <div className="player-info">
                <div className="player-first-name">{firstName}</div>
                <div className="player-last-name">{lastName}</div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                    <div className="details-card">
                        <h3>EVENTS</h3>
                        <p>{player.events || '--'}</p>
                    </div>
                    <div className="details-card">
                        <h3>WINS</h3>
                        <p>{player.wins || '--'}</p>
                    </div>
                    <div className="details-card">
                        <h3>TOP 10</h3>
                        <p>{player.top10s || '--'}</p>
                    </div>
                    <div className="details-card">
                        <h3>POINTS</h3>
                        <p>{player.points || '--'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
