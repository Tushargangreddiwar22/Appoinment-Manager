import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

export function TodoDashboard({ requiredRole }) {
    const [cookies, , removeCookie] = useCookies(["userid", "username"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [profileState, setProfileState] = useState(null);
    const navigate = useNavigate();
    const profileLoading = profileState?.userId !== cookies.userid;
    const profileError = profileState?.userId === cookies.userid ? profileState.error : "";
    const isAdmin = profileState?.userId === cookies.userid && profileState.isAdmin;

    function handleSignout() {
        removeCookie("userid", { path: "/" });
        removeCookie("username", { path: "/" });
        navigate("/");
    }

    useEffect(() => {
        if (!cookies.userid) {
            navigate("/login", { replace: true });
            return;
        }

        let active = true;
        async function verifyProfile() {
            try {
                const response = await axios.get(`${API_URL}/users`);
                const user = response.data.find((item) => item.user_id === cookies.userid);
                if (!user) {
                    navigate("/login", { replace: true });
                    return;
                }
                const profileIsAdmin = user.role === "admin";
                if (active) {
                    setProfileState({
                        userId: cookies.userid,
                        isAdmin: profileIsAdmin,
                        error: ""
                    });
                    if ((requiredRole === "admin") !== profileIsAdmin) {
                        navigate(profileIsAdmin ? "/admin" : "/dashboard", { replace: true });
                    }
                }
            } catch (requestError) {
                console.error("Unable to verify account role:", requestError);
                if (active) {
                    setProfileState({
                        userId: cookies.userid,
                        isAdmin: false,
                        error: "Unable to verify your account. Please check whether the API server is running."
                    });
                }
            }
        }

        verifyProfile();
        return () => {
            active = false;
        };
    }, [cookies.userid, navigate, requiredRole]);

    if (!cookies.userid || profileLoading) {
        return null;
    }

    if (profileError) {
        return <div className="alert alert-danger m-4" role="alert">{profileError}</div>;
    }

    const firstName = cookies.username?.trim().split(/\s+/)[0] || "there";
    const dashboardTitle = isAdmin ? "All appointments" : "My schedule";

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="workspace-label">WORKSPACE</div>
                <div className="workspace-switcher">
                    <span className="workspace-icon"><i className="bi bi-grid-1x2-fill"></i></span>
                    <span><strong>{dashboardTitle}</strong><small>{isAdmin ? "Administrator panel" : "Personal calendar"}</small></span>
                    <i className="bi bi-chevron-down workspace-chevron"></i>
                </div>
                <div className="sidebar-section-label">SCHEDULE</div>
                <nav className="sidebar-nav" aria-label="Dashboard navigation">
                    <NavLink to={isAdmin ? "/admin" : "/dashboard"} end className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
                        <i className="bi bi-calendar2-week"></i><span>{isAdmin ? "All appointments" : "Appointments"}</span>
                        <i className="bi bi-chevron-right sidebar-arrow"></i>
                    </NavLink>
                    {isAdmin && <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
                        <i className="bi bi-people"></i><span>Users &amp; roles</span>
                    </NavLink>}
                    {!isAdmin && <Link to="/dashboard/add" className="sidebar-link">
                        <i className="bi bi-plus-circle"></i><span>New appointment</span>
                    </Link>}
                </nav>
                <div className="sidebar-bottom">
                    <div className="sidebar-tip">
                        <span className="tip-sparkle"><i className="bi bi-stars"></i></span>
                        <strong>{isAdmin ? "A clear view for everyone." : "Stay one step ahead."}</strong>
                        <p>{isAdmin ? "Review appointments across all registered users." : "Your appointments and important details, together in one place."}</p>
                    </div>
                    <button type="button" className="sidebar-signout" onClick={handleSignout}>
                        <i className="bi bi-box-arrow-left"></i> Sign out
                    </button>
                </div>
            </aside>
            <section className="dashboard-content">
                <div className="dashboard-topbar">
                    <div className="breadcrumb-label">Workspace <i className="bi bi-chevron-right"></i> <strong>{dashboardTitle}</strong></div>
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
                        <span className="eyebrow">{isAdmin ? "ADMINISTRATOR PANEL" : "YOUR APPOINTMENT SCHEDULE"}</span>
                        <h1>Good to see you, {firstName}<span className="welcome-period">.</span></h1>
                        <p>{isAdmin ? "View appointments from every user." : "Here’s what’s on your schedule."}</p>
                    </div>
                    {!isAdmin && <Link to="/dashboard/add" className="button button-primary">
                        <i className="bi bi-plus-lg"></i> Add appointment
                    </Link>}
                </div>
                <Outlet context={{ searchTerm, isAdmin }} />
            </section>
        </div>
    );
}
