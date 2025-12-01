export default function CourseCard({ course }) {
    if (!course) return <div className="empty-details">Select a course to view details</div>;

    // Extract tee info (prioritize male, then female, or just take first available)
    let teeInfo = null;
    if (course.tees) {
        if (course.tees.male && course.tees.male.length > 0) {
            teeInfo = course.tees.male[0];
        } else if (course.tees.female && course.tees.female.length > 0) {
            teeInfo = course.tees.female[0];
        }
    }

    return (
        <div className="course-card-container">
            <div className="course-header">
                <h1 className="course-name">{course.name}</h1>
                <div className="course-location">
                    <span>📍</span>
                    {course.city || "Unknown City"}, {course.state || "Unknown State"}, {course.country || "Unknown Country"}
                </div>
                <div className="course-address">{course.address}</div>
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
        </div>
    );
}
