import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

export function ToDoAdd() {
    const [cookies] = useCookies(["userid"]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!cookies.userid) {
            navigate("/login", { replace: true });
        }
    }, [cookies.userid, navigate]);

    const formik = useFormik({
        initialValues: { title: "", description: "", date: "" },
        onSubmit: async (values) => {
            setError("");
            try {
                await axios.post(`${API_URL}/appointments`, {
                    ...values,
                    user_id: cookies.userid,
                    status: "pending"
                });
                navigate("/dashboard");
            } catch (requestError) {
                console.error("Unable to create appointment:", requestError);
                setError("Unable to create this appointment. Please try again.");
            }
        }
    });

    if (!cookies.userid) {
        return null;
    }

    return (
        <section className="task-form-page">
            <div className="task-form-heading"><span className="eyebrow">ADD TO YOUR SCHEDULE</span><h2>New appointment</h2><p>Save the details so you know exactly what’s coming up.</p></div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={formik.handleSubmit} className="task-form-card">
                <div className="mb-3">
                    <label htmlFor="add-title" className="form-label">Appointment</label>
                    <input
                        id="add-title"
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="e.g. Project meeting"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="add-description" className="form-label">Details or notes</label>
                    <textarea
                        id="add-description"
                        rows={4}
                        name="description"
                        className="form-control"
                        placeholder="Add a location, who you're meeting, or anything to remember"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="add-date" className="form-label">Appointment date</label>
                    <input
                        id="add-date"
                        type="date"
                        name="date"
                        className="form-control"
                        value={formik.values.date}
                        onChange={formik.handleChange}
                        required
                    />
                </div>
                <button type="submit" className="button button-primary" disabled={formik.isSubmitting}>
                    <i className="bi bi-calendar-plus"></i> Save appointment
                </button>
                <Link to="/dashboard" className="button button-quiet">Cancel</Link>
            </form>
        </section>
    );
}
