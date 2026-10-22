import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { TodoHome } from "./todo-home.jsx";
import TodoLogin from "./todo-login.jsx";
import { TodoDashboard } from "./todo-dashboard.jsx";
import { TodoRegister } from "./todo-register.jsx";
import { ToDoAdd } from "./todo-add.jsx";
import { ToDoEdit } from "./todo-edit.jsx";
import { ToDoDelete } from "./todo-delete.jsx";
import { ToDoDetails } from "./todo-details.jsx";

function ApplicationLayout() {
    const [cookies] = useCookies(["userid", "username"]);
    const location = useLocation();
    const isDashboard = location.pathname.startsWith("/dashboard");

    return (
        <div className="app-shell">
            <header className="site-header">
                <div className="site-header-inner">
                    <Link to="/" className="brand" aria-label="Appointments home">
                        <span className="brand-mark"><i className="bi bi-calendar2-check"></i></span>
                        <span>Appointments<span className="brand-period">.</span></span>
                    </Link>
                    <nav className="header-actions" aria-label="Main navigation">
                        {cookies.userid ? (
                            <>
                                {!isDashboard && <Link to="/dashboard" className="header-link">My appointments</Link>}
                                <span className="header-user">
                                    <span className="header-avatar">{cookies.username?.charAt(0) || "U"}</span>
                                    <span className="header-user-name">{cookies.username}</span>
                                </span>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="header-link">Sign in</Link>
                                <Link to="/register" className="button button-primary button-small">Get started</Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <main className={isDashboard ? "main-content main-dashboard" : "main-content"}>
                <Routes>
                    <Route path="/" element={<TodoHome />} />
                    <Route path="/login" element={<TodoLogin />} />
                    <Route path="/register" element={<TodoRegister />} />
                    <Route path="/dashboard" element={<TodoDashboard />}>
                        <Route index element={<ToDoDetails />} />
                        <Route path="add" element={<ToDoAdd />} />
                        <Route path="edit/:id" element={<ToDoEdit />} />
                        <Route path="delete/:id" element={<ToDoDelete />} />
                    </Route>
                    <Route path="*" element={<TodoHome />} />
                </Routes>
            </main>
            {!isDashboard && (
                <footer className="site-footer">
                    <span>© {new Date().getFullYear()} Appointment Manager</span>
                    <span>Your schedule, all in one place.</span>
                </footer>
            )}
        </div>
    );
}

export function TodoIndex() {
    return (
        <BrowserRouter>
            <ApplicationLayout />
        </BrowserRouter>
    );
}
