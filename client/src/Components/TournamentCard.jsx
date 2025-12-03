import { useState, useEffect } from 'react';

export default function TournamentCard({ tournament }) {
    const [enrichedTournament, setEnrichedTournament] = useState(null);

    useEffect(() => {
        if (!tournament || !tournament.id) return;

        setEnrichedTournament(null);

        fetch('http://localhost:3000/api/golf/tournaments/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tournament })
        })
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setEnrichedTournament(data);
                } else {
                    setEnrichedTournament(tournament);
                }
            })
            .catch(err => {
                console.error("Failed to enrich tournament:", err);
                setEnrichedTournament(tournament);
            });
    }, [tournament]);

    if (!tournament) return <div className="empty-details">Select a tournament to view details</div>;

    const displayData = enrichedTournament ? { ...tournament, ...enrichedTournament } : tournament;

    // Formatters
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    });

    const startDate = displayData.start_date ? dateFormatter.format(new Date(displayData.start_date)) : 'TBD';
    const endDate = displayData.end_date ? dateFormatter.format(new Date(displayData.end_date)) : 'TBD';
    const dateRange = `${startDate} - ${endDate}, ${displayData.year || ''}`;

    return (
        <div className="course-card-container"> {/* Reusing container style */}
            <div className="course-header">
                <h1 className="course-name">{displayData.name}</h1>
                <div className="course-location">
                    {dateRange}
                </div>
                <div className="course-address">{displayData.format ? `${displayData.format.toUpperCase()} FORMAT` : ''}</div>
            </div>

            <div className="course-stats-grid">
                <div className="stat-box">
                    <span className="stat-label">PURSE</span>
                    <span className="stat-value" style={{ fontSize: '24px' }}>{displayData.purse ? currencyFormatter.format(displayData.purse) : '--'}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">WINNER'S SHARE</span>
                    <span className="stat-value" style={{ fontSize: '24px' }}>{displayData.winners_share ? currencyFormatter.format(displayData.winners_share) : '--'}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">FEDEX PTS</span>
                    <span className="stat-value">{displayData.fedex_points || '--'}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">STATUS</span>
                    <span className="stat-value" style={{ fontSize: '24px' }}>{displayData.status || '--'}</span>
                </div>
            </div>

            {displayData.image_url && (
                <div className="course-image-container">
                    <img src={displayData.image_url} alt={displayData.name} className="course-image" />
                </div>
            )}
        </div>
    );
}