import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3000";

export function ToDoEdit({ adminMode = false }) {
    const [cookies] = useCookies(["userid"]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();
    const dashboardPath = adminMode ? "/admin" : "/dashboard";

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            date: ""
        },
        onSubmit: async (values) => {
            setError("");
            try {
                await axios.patch(`${API_URL}/appointments/${id}`, values);
                navigate(dashboardPath);
            } catch (requestError) {
                console.error("Unable to update appointment:", requestError);
                setError("Unable to save this appointment. Please try again.");
            }
        }
    });
    const { setValues } = formik;

    useEffect(() => {
        let active = true;

        async function loadAppointment() {
            setLoading(true);
            setError("");
            try {
                const [response, usersResponse] = await Promise.all([
                    axios.get(`${API_URL}/appointments/${id}`),
                    axios.get(`${API_URL}/users`)
                ]);
                const currentUser = usersResponse.data.find((user) => user.user_id === cookies.userid);
                const currentUserIsAdmin = currentUser?.role === "admin";
                if ((adminMode && !currentUserIsAdmin)
                    || (!currentUserIsAdmin && response.data.user_id !== cookies.userid)) {
                    navigate(currentUserIsAdmin ? "/admin" : "/dashboard", { replace: true });
                    return;
                }
                if (active) {
                    setAuthorized(true);
                    setValues({
                        title: response.data.title ?? "",
                        description: response.data.description ?? "",
                        date: response.data.date?.slice(0, 10) ?? ""
                    });
                }
            } catch (requestError) {
                console.error("Unable to load appointment:", requestError);
                if (active) {
                    setError("Unable to load this appointment. It may have been deleted.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (cookies.userid) {
            loadAppointment();
        } else {
            navigate("/login", { replace: true });
        }

        return () => {
            active = false;
        };
    }, [adminMode, cookies.userid, id, navigate, setValues]);

    if (loading) {
        return <p className="mt-3" role="status">Loading appointment...</p>;
    }
    if (!authorized) {
        return null;
    }

    return (
        <section className="task-form-page">
            <div className="task-form-heading"><span className="eyebrow">{adminMode ? "ADMINISTRATOR PANEL" : "UPDATE YOUR SCHEDULE"}</span><h2>Edit appointment</h2><p>Update the details or change the date.</p></div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <form onSubmit={formik.handleSubmit} className="task-form-card">
                <div className="mb-3">
                    <label htmlFor="edit-title" className="form-label">Appointment</label>
                    <input
                        id="edit-title"
                        type="text"
                        name="title"
                        className="form-control"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="edit-description" className="form-label">Details or notes</label>
                    <textarea
                        id="edit-description"
                        rows={4}
                        name="description"
                        className="form-control"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="edit-date" className="form-label">Appointment date</label>
                    <input
                        id="edit-date"
                        type="date"
                        name="date"
                        className="form-control"
                        value={formik.values.date}
                        onChange={formik.handleChange}
                        required
                    />
                </div>
                <button type="submit" className="button button-primary" disabled={formik.isSubmitting}>
                    <i className="bi bi-check2"></i> Save appointment
                </button>
                <Link to={dashboardPath} className="button button-quiet">Cancel</Link>
            </form>
        </section>
    );
}
