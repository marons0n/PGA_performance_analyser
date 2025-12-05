import React from 'react';

export default function PlayerCard({ player, onCompare }) {
    if (!player) return null;

    const firstName = player.first_name || player.firstName || "";
    const lastName = player.last_name || player.lastName || "";
    const country = player.country || "Unknown";
    const flagUrl = player.flag_url;
    const age = player.age;

    const rankCurrent = player.rank_current || player.rank;
    const rankPrev = player.rank_previous;
    const rankTrend = player.rank_trend;

    const totalPoints = player.total_points;
    const avgPoints = player.average_points;
    const totalEvents = player.total_events;

    return (
        <div className="player-card">
            <div className="player-left-col">
                <div className="player-image-placeholder">
                    <svg viewBox="0 0 24 24" fill="black" className="player-icon-svg">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
            </div>

            <div className="player-info">
                <div className="player-header">
                    <div className="player-names">
                        <div className="player-first-name">{firstName}</div>
                        <div className="player-last-name">{lastName}</div>
                        <button className="compare-btn" onClick={() => onCompare(player)}>
                            COMPARE
                        </button>
                    </div>
                    <div className="player-rank-box">
                        <span className="rank-label">CURRENT RANK</span>
                        <span className="rank-value">#{rankCurrent}</span>

                        <div className="rank-meta-row">
                            {flagUrl && (
                                <div className="mini-flag-container">
                                    <img src={flagUrl} alt={country} className="mini-flag" />
                                    <span className="mini-country">{country}</span>
                                </div>
                            )}
                            {age && <span className="mini-age">AGE: {age}</span>}
                        </div>
                    </div>
                </div>

                <div className="player-stats-grid">
                    <div className="stat-box">
                        <span className="stat-label">TOTAL POINTS</span>
                        <span className="stat-value">{totalPoints ? Number(totalPoints).toFixed(2) : '--'}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">AVG POINTS</span>
                        <span className="stat-value">{avgPoints ? Number(avgPoints).toFixed(2) : '--'}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">EVENTS PLAYED</span>
                        <span className="stat-value">{totalEvents || '--'}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">PREV RANK</span>
                        <span className="stat-value">{rankPrev ? `#${rankPrev}` : '--'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
