import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function TournamentPurseChart({ maxTournaments = 8 }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        const parseNumber = (val) => {
            if (val == null) return 0
            if (typeof val === 'number') return val
            if (typeof val === 'string' && val.trim() !== '') {
                const n = Number(val)
                if (!Number.isNaN(n)) return n
            }
            if (typeof val === 'object') {
                if (val.$numberInt) return Number(val.$numberInt)
                if (val.$numberLong) return Number(val.$numberLong)
                if (val.$numberDouble) return Number(val.$numberDouble)
            }
            return 0
        }

        fetch('http://localhost:3000/tournaments')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch tournaments')
                return res.json()
            })
            .then(json => {
                if (cancelled) return
                const schedule = Array.isArray(json) ? json : []
                const chartData = schedule
                    .map(s => ({
                        id: s.id || s.tournId || s.tourn_id || s.tournId,
                        name: s.name || s.tournName || s.tourn_name || s.tournName || 'Unknown',
                        winnersShare: parseNumber(s.winnersShare || s.winners_share || s.winnersShare?.$numberInt || s.winnersShare?.$numberLong || 0),
                        fedexCupPoints: parseNumber(s.fedexCupPoints || s.fedex_cup_points || s.fedexCupPoints?.$numberInt || 0),
                        week: s.start_date || s.week || (s.date?.weekNumber) || ''
                    }))
                    .sort((a, b) => b.winnersShare - a.winnersShare)
                    .slice(0, maxTournaments)
                setData(chartData)
            })
            .catch(err => {
                console.error('Failed to load tournaments from API', err)
                setData([])
            })
            .finally(() => setLoading(false))

        return () => { cancelled = true }
    }, [maxTournaments])

    return (
        <div style={{ width: '100%', height: 350 }}>
            <h3 style={{ margin: '6px 12px' }}>Top Tournaments by Winner's Share</h3>
            <div style={{ margin: '0 12px 6px 12px', color: '#666', fontSize: 13 }}>Winner's Share (USD)</div>

            {loading ? (
                <div style={{ height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Loading tournaments...</div>
            ) : !data || data.length === 0 ? (
                <div style={{ height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No tournament data</div>
            ) : (
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={data} margin={{ top: 10, right: 16, left: 110, bottom: 100 }}>
                        <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis tickFormatter={(val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)} />
                        <Bar dataKey="winnersShare" fill="#decc07ff" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
