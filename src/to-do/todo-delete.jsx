import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3000";

export function ToDoDelete() {
    const [cookies] = useCookies(["userid"]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        let active = true;

        async function verifyTask() {
            try {
                const response = await axios.get(`${API_URL}/appointments/${id}`);
                if (response.data.user_id !== cookies.userid) {
                    navigate("/dashboard", { replace: true });
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
    }, [cookies.userid, id, navigate]);

    async function deleteTask() {
        setError("");
        try {
            await axios.delete(`${API_URL}/appointments/${id}`);
            navigate("/dashboard");
        } catch (requestError) {
            console.error("Unable to delete appointment:", requestError);
            setError("Unable to delete this appointment. Please try again.");
        }
    }

    return (
        <section className="task-form-page">
            <div className="task-form-heading"><span className="eyebrow">APPOINTMENT MANAGEMENT</span><h2>Delete appointment</h2><p>This action can’t be undone.</p></div>
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
                        <Link to="/dashboard" className="button button-quiet">Keep appointment</Link>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
