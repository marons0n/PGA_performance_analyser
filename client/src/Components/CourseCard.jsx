import { useState, useEffect } from 'react';

export default function CourseCard({ course }) {
    const [enrichedCourse, setEnrichedCourse] = useState(null);

    useEffect(() => {
        if (!course || !course.id) return;

        setEnrichedCourse(null); // Reset while loading

        // Call the backend to get cached or new course data (with image)
        fetch('http://localhost:3000/api/golf/courses/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course })
        })
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setEnrichedCourse(data);
                } else {
                    // Fallback to basic data if error
                    setEnrichedCourse(course);
                }
            })
            .catch(err => {
                console.error("Failed to enrich course:", err);
                setEnrichedCourse(course);
            });
    }, [course]);

    if (!course) return <div className="empty-details">Select a course to view details</div>;

    // Use enriched data if available, otherwise basic prop data
    const displayData = enrichedCourse || course;

    // Extract tee info (prioritize male, then female, or just take first available)
    let teeInfo = null;
    if (displayData.tees) {
        if (displayData.tees.male && displayData.tees.male.length > 0) {
            teeInfo = displayData.tees.male[0];
        } else if (displayData.tees.female && displayData.tees.female.length > 0) {
            teeInfo = displayData.tees.female[0];
        }
    }

    return (
        <div className="course-card-container">
            

            <div className="course-header">
                <h1 className="course-name">{displayData.name}</h1>
                <div className="course-location">
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
