import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function PlayerPointsChart({ players = [], maxPlayers = 8 }) {
    const hasPlayers = Array.isArray(players) && players.length > 0

    const data = hasPlayers
        ? players
              .map(p => ({ name: p.name || 'Unknown', points: Number(p.points) || 0 }))
              .sort((a, b) => b.points - a.points)
              .slice(0, maxPlayers)
        : []

    return (
        <div className="player-points-chart" style={{ width: '100%', height: 260 }}>
            <h3 style={{ margin: '6px 12px' }}>Top Players</h3>
            <div style={{ margin: '0 12px 6px 12px', color: '#666', fontSize: 13 }}>Points</div>

            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={data} margin={{ top: 10, right: 16, left: 16, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="points" fill="#1976d2" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div style={{ height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    {hasPlayers ? 'No data available' : 'Loading players...'}
                </div>
            )}
        </div>
    )
}
