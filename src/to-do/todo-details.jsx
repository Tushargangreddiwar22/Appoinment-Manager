import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useOutletContext } from "react-router-dom";

const API_URL = "http://localhost:3000";

export function ToDoDetails() {
    const [appointments, setAppointments] = useState([]);
    const [cookies] = useCookies(["userid"]);
    const [error, setError] = useState("");
    const { searchTerm = "" } = useOutletContext() ?? {};
    const filteredAppointments = appointments.filter((appointment) => (
        `${appointment.title} ${appointment.description}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
    ));

    useEffect(() => {
        let active = true;

        async function loadAppointments() {
            setError("");
            try {
                const response = await axios.get(`${API_URL}/appointments`);
                if (active) {
                    setAppointments(
                        response.data.filter((appointment) => appointment.user_id === cookies.userid)
                    );
                }
            } catch (requestError) {
                console.error("Unable to load appointments:", requestError);
                if (active) {
                    setError("Unable to load appointments. Please check whether the API server is running.");
                }
            }
        }

        if (cookies.userid) {
            loadAppointments();
        }

        return () => {
            active = false;
        };
    }, [cookies.userid]);

    const dueTodayCount = appointments.filter((appointment) => appointment.date === new Date().toISOString().slice(0, 10)).length;
    const upcomingCount = appointments.filter((appointment) => appointment.date >= new Date().toISOString().slice(0, 10)).length;

    return (
        <div className="container-fluid">
            <div className="task-stats">
                <article className="stat-card"><span className="stat-icon stat-icon-blue"><i className="bi bi-calendar2-week"></i></span><span><small>All appointments</small><strong>{appointments.length}</strong></span></article>
                <article className="stat-card"><span className="stat-icon stat-icon-green"><i className="bi bi-calendar2-check"></i></span><span><small>Upcoming</small><strong>{upcomingCount}</strong></span></article>
                <article className="stat-card"><span className="stat-icon stat-icon-amber"><i className="bi bi-calendar-event"></i></span><span><small>Today</small><strong>{dueTodayCount}</strong></span></article>
            </div>

            {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
            <section className="task-list-card">
                <div className="task-list-header">
                    <div><h2>Your appointments</h2><p>Meetings, visits, and plans on your calendar.</p></div>
                    <span className="task-count">{filteredAppointments.length} {filteredAppointments.length === 1 ? "appointment" : "appointments"}</span>
                </div>
                {error ? null : filteredAppointments.length > 0 ? (
                    <div className="task-list">
                        {filteredAppointments.map((appointment) => {
                            const taskDate = appointment.date ? new Date(`${appointment.date}T00:00:00`) : null;
                            const isPast = taskDate && taskDate < new Date(new Date().setHours(0, 0, 0, 0));
                            return (
                                <article className="task-row" key={appointment.id}>
                                    <span className="task-row-mark" aria-hidden="true"></span>
                                    <div className="task-row-main">
                                        <h3>{appointment.title}</h3>
                                        <p>{appointment.description || "No description added."}</p>
                                    </div>
                                    <span className={`task-date${isPast ? " task-date-overdue" : ""}`}>
                                        <i className="bi bi-calendar3"></i>
                                        {taskDate ? taskDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No date"}
                                    </span>
                                    <div className="task-row-actions">
                                        <Link to={`edit/${appointment.id}`} className="icon-button" aria-label={`Edit ${appointment.title}`}><i className="bi bi-pencil"></i></Link>
                                        <Link to={`delete/${appointment.id}`} className="icon-button icon-button-danger" aria-label={`Delete ${appointment.title}`}><i className="bi bi-trash3"></i></Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><i className={searchTerm ? "bi bi-search" : "bi bi-check2-square"}></i></span>
                        <h3>{searchTerm ? "No matching appointments" : "Your schedule is clear"}</h3>
                        <p>{searchTerm ? "Try a different search or clear your search field." : "Add an appointment to keep your plans organized."}</p>
                        {!searchTerm && <Link to="/dashboard/add" className="button button-primary"><i className="bi bi-plus-lg"></i> Add an appointment</Link>}
                    </div>
                )}
            </section>
            </div>
    );
}
