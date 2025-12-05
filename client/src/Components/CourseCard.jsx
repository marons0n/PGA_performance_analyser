import { useState, useEffect } from 'react';

export default function CourseCard({ course, user }) {
    const [enrichedCourse, setEnrichedCourse] = useState(null);
    const [isFlagged, setIsFlagged] = useState(false);

    // Fetch enriched course data
    useEffect(() => {
        if (!course || !course.id) return;

        setEnrichedCourse(null);

        fetch('http://localhost:3000/api/golf/courses/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course })
        })
            .then(res => res.json())
            .then(data => setEnrichedCourse(data && !data.error ? data : course))
            .catch(() => setEnrichedCourse(course));
    }, [course]);

    // Fetch whether course is flagged for this user
    useEffect(() => {
        if (!course || !course.id || !user) return;

        fetch("http://localhost:3000/api/golf/courses/isFlagged", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                user_id: String(user.id),
                course_id: String(course.id)
            })
            
        })
            .then(res => res.json())
            .then(data => setIsFlagged(data.flagged))
            .catch(err => console.error("Flag check failed:", err));
    }, [course, user]);

    async function handleFlagToggle() {
        if (!user || !course) return;

        try {
            const res = await fetch("http://localhost:3000/api/golf/courses/flag", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    user_id: String(user.id),
                    course_id: String(course.id),
                    flag: !isFlagged
                })                
            });

            if (res.ok) {
                setIsFlagged(!isFlagged);
            }
        } catch (err) {
            console.error("Failed to toggle flag:", err);
        }
    }

    if (!course) return <div className="empty-details">Select a course to view details</div>;

    const displayData = enrichedCourse || course;

    let teeInfo = null;
    if (displayData.tees) {
        if (displayData.tees.male?.length > 0) {
            teeInfo = displayData.tees.male[0];
        } else if (displayData.tees.female?.length > 0) {
            teeInfo = displayData.tees.female[0];
        }
    }

    return (
        <div className="course-card-container">
            
            <div className="course-header">
                <h1 className="course-name">{displayData.name}</h1>

                {/* FLAG BUTTON */}
                {user && (
                    <button
                        onClick={handleFlagToggle}
                        className="flag-button"
                        style={{
                            marginTop: "8px",
                            padding: "6px 12px",
                            fontSize: "14px",
                            cursor: "pointer",
                            background: isFlagged ? "#b30000" : "#004400",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            width: "120px"
                        }}
                    >
                        {isFlagged ? "🚩 Flagged" : "⚑ Flag Course"}
                    </button>
                )}

                <div className="course-location" style={{ marginTop: "14px" }}>
                    {displayData.city || "Unknown City"}, {displayData.state || "Unknown State"}, {displayData.country || "Unknown Country"}
                </div>
                <div className="course-address">{displayData.address}</div>
            </div>

            {teeInfo ? (
                <div className="course-stats-grid">
                    <div className="stat-box">
                        <span className="stat-label">PAR</span>
                        <span className="stat-value">{teeInfo.par_total || '--'}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">YARDS</span>
                        <span className="stat-value">{teeInfo.total_yards || '--'}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">RATING</span>
                        <span className="stat-value">{teeInfo.course_rating || '--'}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">SLOPE</span>
                        <span className="stat-value">{teeInfo.slope_rating || '--'}</span>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '40px', fontFamily: 'Cinzel, serif' }}>
                    NO TEE INFORMATION AVAILABLE
                </div>
            )}

            {displayData.image_url && (
                <div className="course-image-container">
                    <img src={displayData.image_url} alt={displayData.name} className="course-image" />
                </div>
            )}
        </div>
    );
}
