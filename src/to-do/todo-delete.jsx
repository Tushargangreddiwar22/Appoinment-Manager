import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3000";

export function ToDoDelete({ adminMode = false }) {
    const [cookies] = useCookies(["userid"]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const dashboardPath = adminMode ? "/admin" : "/dashboard";

    useEffect(() => {
        let active = true;

        async function verifyTask() {
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
                } else if (active) {
                    setAuthorized(true);
                }
            } catch (requestError) {
                console.error("Unable to load appointment for deletion:", requestError);
                if (active) {
                    setError("Unable to find this appointment. It may have already been deleted.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (cookies.userid) {
            verifyTask();
        } else {
            navigate("/login", { replace: true });
        }

        return () => {
            active = false;
        };
    }, [adminMode, cookies.userid, id, navigate]);

    async function deleteTask() {
        setError("");
        try {
            await axios.delete(`${API_URL}/appointments/${id}`);
            navigate(dashboardPath);
        } catch (requestError) {
            console.error("Unable to delete appointment:", requestError);
            setError("Unable to delete this appointment. Please try again.");
        }
    }

    return (
        <section className="task-form-page">
            <div className="task-form-heading"><span className="eyebrow">{adminMode ? "ADMINISTRATOR PANEL" : "APPOINTMENT MANAGEMENT"}</span><h2>Delete appointment</h2><p>This action can’t be undone.</p></div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {loading ? (
                <p role="status">Loading appointment...</p>
            ) : authorized ? (
                <div className="delete-confirm-card">
                    <span className="delete-confirm-icon"><i className="bi bi-trash3"></i></span>
                    <h3>Remove this appointment?</h3>
                    <p>It will be permanently removed from your appointment schedule.</p>
                    <div className="delete-actions">
                        <button type="button" className="button button-danger" onClick={deleteTask} disabled={Boolean(error)}>
                            <i className="bi bi-trash3"></i> Delete appointment
                        </button>
                        <Link to={dashboardPath} className="button button-quiet">Keep appointment</Link>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
