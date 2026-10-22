import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

export function TodoDashboard() {
    const [cookies, , removeCookie] = useCookies(["userid", "username"]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    function handleSignout() {
        removeCookie("userid", { path: "/" });
        removeCookie("username", { path: "/" });
        navigate("/");
    }

    useEffect(() => {
        if (!cookies.userid) {
            navigate("/login", { replace: true });
        }
    }, [cookies.userid, navigate]);

    if (!cookies.userid) {
        return null;
    }

    const firstName = cookies.username?.trim().split(/\s+/)[0] || "there";

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="workspace-label">WORKSPACE</div>
                <div className="workspace-switcher">
                    <span className="workspace-icon"><i className="bi bi-grid-1x2-fill"></i></span>
                    <span>                    <strong>My schedule</strong><small>Personal calendar</small></span>
                    <i className="bi bi-chevron-down workspace-chevron"></i>
                </div>
                <div className="sidebar-section-label">SCHEDULE</div>
                <nav className="sidebar-nav" aria-label="Dashboard navigation">
                    <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
                        <i className="bi bi-calendar2-week"></i><span>Appointments</span>
                        <i className="bi bi-chevron-right sidebar-arrow"></i>
                    </NavLink>
                    <Link to="/dashboard/add" className="sidebar-link">
                        <i className="bi bi-plus-circle"></i><span>New appointment</span>
                    </Link>
                </nav>
                <div className="sidebar-bottom">
                    <div className="sidebar-tip">
                        <span className="tip-sparkle"><i className="bi bi-stars"></i></span>
                        <strong>Stay one step ahead.</strong>
                        <p>Your appointments and important details, together in one place.</p>
                    </div>
                    <button type="button" className="sidebar-signout" onClick={handleSignout}>
                        <i className="bi bi-box-arrow-left"></i> Sign out
                    </button>
                </div>
            </aside>
            <section className="dashboard-content">
                <div className="dashboard-topbar">
                    <div className="breadcrumb-label">Workspace <i className="bi bi-chevron-right"></i> <strong>Appointments</strong></div>
                    <div className="dashboard-top-actions">
                        <label className="search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="search"
                                placeholder="Search appointments..."
                                aria-label="Search appointments"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                            <span className="search-shortcut">⌘ K</span>
                        </label>
                        <span className="dashboard-avatar" title={cookies.username}>{cookies.username?.charAt(0) || "U"}</span>
                    </div>
                </div>
                <div className="dashboard-welcome">
                    <div>
                        <span className="eyebrow">YOUR APPOINTMENT SCHEDULE</span>
                        <h1>Good to see you, {firstName}<span className="welcome-period">.</span></h1>
                        <p>Here’s what’s on your schedule.</p>
                    </div>
                    <Link to="/dashboard/add" className="button button-primary">
                        <i className="bi bi-plus-lg"></i> Add appointment
                    </Link>
                </div>
                <Outlet context={{ searchTerm }} />
            </section>
        </div>
    );
}
