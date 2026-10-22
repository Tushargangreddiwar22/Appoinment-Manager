
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export function TodoRegister() {

    const navigate = useNavigate();
    const [error, setError] = useState("");

    const formik = useFormik({
        initialValues: {
            user_id: "",
            user_name: "",
            password: "",
            email: ""
        },

        onSubmit: async (user) => {
            try {
                setError("");

                // Get all registered users
                const response = await axios.get(
                    "http://localhost:3000/users"
                );

                // User IDs and email addresses must be unique; passwords do not.
                const existingUser = response.data.find(
                    (item) =>
                        item.user_id?.trim().toLowerCase() ===
                            user.user_id.trim().toLowerCase() ||
                        item.email?.trim().toLowerCase() ===
                            user.email.trim().toLowerCase()
                );

                // If user already exists
                if (existingUser) {

                    if (
                        existingUser.user_id?.trim().toLowerCase() ===
                        user.user_id.trim().toLowerCase()
                    ) {
                        setError(
                            "User ID already exists. Please use a different User ID."
                        );
                    }
                    else if (
                        existingUser.email?.trim().toLowerCase() ===
                        user.email.trim().toLowerCase()
                    ) {
                        setError(
                            "Email already registered. Please use a different Email."
                        );
                    }
                    return;
                }

                // Register new user
                await axios.post(
                    "http://localhost:3000/users",
                    {
                        ...user,
                        user_id: user.user_id.trim(),
                        email: user.email.trim()
                    }
                );

                alert("Registered Successfully...");

                formik.resetForm();
                navigate("/login");

            }
            catch (error) {
                console.error("Registration failed:", error);

                setError(
                    "Registration failed. Please check whether JSON Server is running."
                );
            }
        }
    });

    return (
        <div className="auth-page">
            <aside className="auth-story auth-story-register">
                <span className="auth-story-icon"><i className="bi bi-calendar2-plus"></i></span>
                <span className="eyebrow">YOUR SCHEDULE, SIMPLIFIED</span>
                <h1>Make time for<br />what matters.</h1>
                <p>Keep meetings, visits, and important plans organized in one convenient place.</p>
                <div className="auth-story-foot"><i className="bi bi-calendar-check"></i> A better view of what’s ahead.</div>
            </aside>
            <div className="auth-panel">
                <form
                    onSubmit={formik.handleSubmit}
                    className="auth-card auth-card-register"
                >
                    <span className="auth-card-icon"><i className="bi bi-person-plus"></i></span>
                    <span className="eyebrow">GET STARTED</span>
                    <h2>Create your account</h2>
                    <p className="auth-subtitle">Set up your personal appointment schedule.</p>

                    {/* User ID */}
                    <div className="mb-2">
                        <label htmlFor="register-user-id" className="form-label fw-semibold">
                            User ID
                        </label>

                        <div className="input-group">
                            <span className="input-group-text auth-input-icon">
                                <i className="bi bi-person-badge"></i>
                            </span>

                            <input
                                type="text"
                                id="register-user-id"
                                name="user_id"
                                placeholder="Choose a user ID"
                                aria-label="User ID"
                                value={formik.values.user_id}
                                onChange={formik.handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    {/* User Name */}
                    <div className="mb-2">
                        <label htmlFor="register-user-name" className="form-label fw-semibold">
                            User Name
                        </label>

                        <div className="input-group">
                            <span className="input-group-text auth-input-icon">
                                <i className="bi bi-person"></i>
                            </span>

                            <input
                                type="text"
                                id="register-user-name"
                                name="user_name"
                                placeholder="Your name"
                                aria-label="User name"
                                value={formik.values.user_name}
                                onChange={formik.handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-2">
                        <label htmlFor="register-password" className="form-label fw-semibold">
                            Password
                        </label>

                        <div className="input-group">
                            <span className="input-group-text auth-input-icon">
                                <i className="bi bi-lock"></i>
                            </span>

                            <input
                                type="password"
                                id="register-password"
                                name="password"
                                placeholder="Create a password"
                                aria-label="Password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label htmlFor="register-email" className="form-label fw-semibold">
                            Email Address
                        </label>

                        <div className="input-group">
                            <span className="input-group-text auth-input-icon">
                                <i className="bi bi-envelope"></i>
                            </span>

                            <input
                                type="email"
                                id="register-email"
                                name="email"
                                placeholder="you@example.com"
                                aria-label="Email address"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            className="alert alert-danger py-2"
                            role="alert"
                        >
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    )}

                    {/* Register Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={formik.isSubmitting}
                    >
                        <i className="bi bi-person-check me-2"></i>
                        {formik.isSubmitting ? "Creating account..." : "Create account"}
                    </button>

                    <div className="auth-switch">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>

                </form>
            </div>
        </div>
    );
}
