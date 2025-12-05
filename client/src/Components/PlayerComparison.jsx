import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PlayerComparison({ player1, player2, onClose }) {
    if (!player1 || !player2) return null;

    const stats = [
        { name: 'Rank', p1: player1.rank_current || player1.rank, p2: player2.rank_current || player2.rank, reverse: true }, // Lower is better
        { name: 'Points', p1: player1.total_points || 0, p2: player2.total_points || 0 },
        { name: 'Avg Pts', p1: player1.average_points || 0, p2: player2.average_points || 0 },
        { name: 'Events', p1: player1.total_events || 0, p2: player2.total_events || 0 },
    ];

    const data = stats.map(stat => ({
        name: stat.name,
        [player1.name]: stat.p1,
        [player2.name]: stat.p2,
        reverse: stat.reverse
    }));

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const formatValue = (val) => {
                if (label === 'Points' || label === 'Avg Pts') {
                    return Number(val).toFixed(2);
                }
                return val;
            };
            return (
                <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                    <p style={{ fontWeight: 'bold' }}>{label}</p>
                    <p style={{ color: '#003366' }}>{player1.name}: {formatValue(payload[0].value)}</p>
                    <p style={{ color: '#8884d8' }}>{player2.name}: {formatValue(payload[1].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="comparison-container">
            <div className="comparison-header">
                <h2 className="comparison-title">PLAYER COMPARISON</h2>
                <button className="close-btn" onClick={onClose}>CLOSE</button>
            </div>

            <div className="comparison-grid">
                {/* Player 1 Info */}
                <div className="comparison-player-card">
                    <div className="comparison-name">{player1.name}</div>
                    <div className="comparison-rank">#{player1.rank_current || player1.rank}</div>
                </div>

                {/* VS */}
                <div className="comparison-vs">VS</div>

                {/* Player 2 Info */}
                <div className="comparison-player-card">
                    <div className="comparison-name">{player2.name}</div>
                    <div className="comparison-rank">#{player2.rank_current || player2.rank}</div>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey={player1.name} fill="#003366" name={player1.name} />
                        <Bar dataKey={player2.name} fill="#8884d8" name={player2.name} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
