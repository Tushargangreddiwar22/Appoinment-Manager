import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

export default function TodoLogin() {
    const [, setCookie] = useCookies(["userid", "username"]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: { user_id: "", password: "" },
        onSubmit: async (values) => {
            setError("");
            try {
                const response = await axios.get(`${API_URL}/users`);
                const user = response.data.find(
                    (item) => item.user_id?.trim().toLowerCase() === values.user_id.trim().toLowerCase()
                );

                if (!user || user.password !== values.password) {
                    setError("Invalid user ID or password.");
                    return;
                }

                setCookie("userid", user.user_id, { path: "/" });
                setCookie("username", user.user_name, { path: "/" });
                navigate(
                    user.role === "admin"
                        ? "/admin"
                        : "/dashboard"
                );
            } catch (requestError) {
                console.error("Unable to sign in:", requestError);
                setError("Unable to sign in. Please check whether the API server is running.");
            }
        }
    });

    return (
        <div className="auth-page">
            <aside className="auth-story">
                <span className="auth-story-icon"><i className="bi bi-calendar2-check"></i></span>
                <span className="eyebrow">WELCOME BACK</span>
                <h1>Pick up where<br />you left off.</h1>
                <p>Your schedule is waiting. Sign in to see what’s coming up and keep your plans in order.</p>
                <div className="auth-story-foot"><i className="bi bi-calendar-check"></i> Your appointments, all in one place.</div>
            </aside>
            <div className="auth-panel">
            <form onSubmit={formik.handleSubmit} className="auth-card">
                <span className="auth-card-icon"><i className="bi bi-person"></i></span>
                <span className="eyebrow">YOUR SPACE IS READY</span>
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Sign in to continue to your workspace.</p>
                <div className="mb-3">
                    <label htmlFor="login-user-id" className="form-label">User ID</label>
                    <input
                        id="login-user-id"
                        type="text"
                        name="user_id"
                        value={formik.values.user_id}
                        onChange={formik.handleChange}
                        className="form-control"
                        autoComplete="username"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="login-password" className="form-label">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        className="form-control"
                        autoComplete="current-password"
                        required
                    />
                </div>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <button type="submit" className="btn btn-primary w-100" disabled={formik.isSubmitting}>
                    Sign in <i className="bi bi-arrow-right ms-2"></i>
                </button>
                <div className="auth-switch">
                    New here? <Link to="/register">Create an account</Link>
                </div>
            </form>
            </div>
        </div>
    );
}
