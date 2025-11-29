
export default function Profile({ user, goBack }) {
    return (<>
        <div id='menu-wrapper'>
            <div className="menu-bar">
                <span className="menu-title" onClick={goBack} style={{ cursor: 'pointer' }}>PGA Performance Analyser</span>
                <img src="/profile.png" className="profile-icon" />
            </div>
            <div id='content'>
                <div className="profile-container">
                    <div className="profile-text-large">{user.firstName}</div>
                    <div className="profile-text-large bold">{user.lastName}</div>
                    <div className="profile-email">{user.email}</div>
                </div>
            </div>
        </div>
    </>)
}