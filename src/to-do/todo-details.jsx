import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useOutletContext } from "react-router-dom";

const API_URL = "http://localhost:3000";
const PAGE_SIZE = 5;
const appointmentFilters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" }
];

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function ToDoDetails() {
    const [appointments, setAppointments] = useState([]);
    const [cookies] = useCookies(["userid"]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const { searchTerm = "", isAdmin = false } = useOutletContext() ?? {};
    const [pagination, setPagination] = useState({ page: 1, searchTerm });
    const today = getTodayDate();
    const matchingAppointments = appointments.filter((appointment) => {
        const matchesSearch = `${appointment.title} ${appointment.description} ${appointment.user_name ?? ""} ${appointment.user_id ?? ""}`.toLowerCase()
            .includes(searchTerm.trim().toLowerCase());
        const isCompleted = appointment.status === "completed";
        const isUpcoming = !isCompleted && (appointment.date?.slice(0, 10) ?? "") >= today;
        const matchesFilter = activeFilter === "all"
            || (activeFilter === "pending" && !isCompleted)
            || (activeFilter === "upcoming" && isUpcoming)
            || (activeFilter === "completed" && isCompleted);

        return matchesSearch && matchesFilter;
    });
    const pageCount = Math.max(1, Math.ceil(matchingAppointments.length / PAGE_SIZE));
    const displayedPage = Math.min(
        pagination.searchTerm === searchTerm ? pagination.page : 1,
        pageCount
    );
    const paginatedAppointments = matchingAppointments.slice(
        (displayedPage - 1) * PAGE_SIZE,
        displayedPage * PAGE_SIZE
    );

    useEffect(() => {
        let active = true;

        async function loadAppointments() {
            setError("");
            setLoading(true);
            try {
                const [response, userResponse] = await Promise.all([
                    axios.get(`${API_URL}/appointments`),
                    isAdmin ? axios.get(`${API_URL}/users`) : Promise.resolve({ data: [] })
                ]);
                if (active) {
                    setAppointments(
                        response.data
                            .filter((appointment) => isAdmin || appointment.user_id === cookies.userid)
                            .map((appointment) => ({
                                ...appointment,
                                user_name: userResponse.data.find((user) => user.user_id === appointment.user_id)?.user_name
                            }))
                    );
                }
            } catch (requestError) {
                console.error("Unable to load appointments:", requestError);
                if (active) {
                    setError("Unable to load appointments. Please check whether the API server is running.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (cookies.userid) {
            loadAppointments();
        }

        return () => {
            active = false;
        };
    }, [cookies.userid, isAdmin]);

    async function updateStatus(appointment, status) {
        setError("");
        setUpdatingAppointmentId(appointment.id);
        try {
            const response = await axios.patch(`${API_URL}/appointments/${appointment.id}`, {
                status
            });
            setAppointments((existingAppointments) => existingAppointments.map((existingAppointment) => (
                existingAppointment.id === appointment.id ? response.data : existingAppointment
            )));
        } catch (requestError) {
            console.error("Unable to update appointment status:", requestError);
            setError("Unable to update this appointment status. Please try again.");
        } finally {
            setUpdatingAppointmentId(null);
        }
    }

    const pendingCount = appointments.filter((appointment) => appointment.status !== "completed").length;
    const upcomingCount = appointments.filter((appointment) => (
        appointment.status !== "completed" && (appointment.date?.slice(0, 10) ?? "") >= today
    )).length;
    const completedCount = appointments.filter((appointment) => appointment.status === "completed").length;

    return (
        <div className="container-fluid">
            <div className="task-stats">
                <article className="stat-card"><span className="stat-icon stat-icon-blue"><i className="bi bi-hourglass-split"></i></span><span><small>Pending</small><strong>{pendingCount}</strong></span></article>
                <article className="stat-card"><span className="stat-icon stat-icon-green"><i className="bi bi-calendar2-week"></i></span><span><small>Upcoming</small><strong>{upcomingCount}</strong></span></article>
                <article className="stat-card"><span className="stat-icon stat-icon-amber"><i className="bi bi-calendar2-check"></i></span><span><small>Completed</small><strong>{completedCount}</strong></span></article>
            </div>

            {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
            <section className="task-list-card">
                <div className="task-list-header">
                    <div><h2>{isAdmin ? "All appointments" : "Your appointments"}</h2><p>{isAdmin ? "Appointments across all registered users." : "Meetings, visits, and plans on your calendar."}</p></div>
                    <span className="task-count">{matchingAppointments.length} {matchingAppointments.length === 1 ? "appointment" : "appointments"}</span>
                </div>
                <div className="appointment-filters" role="tablist" aria-label="Filter appointments">
                    {appointmentFilters.map((filter) => (
                        <button
                            key={filter.id}
                            type="button"
                            role="tab"
                            aria-selected={activeFilter === filter.id}
                            className={`appointment-filter${activeFilter === filter.id ? " active" : ""}`}
                            onClick={() => {
                                setActiveFilter(filter.id);
                                setPagination({ page: 1, searchTerm });
                            }}
                        >
                            {filter.label}
                            <span>{filter.id === "all" ? appointments.length : filter.id === "pending" ? pendingCount : filter.id === "upcoming" ? upcomingCount : completedCount}</span>
                        </button>
                    ))}
                </div>
                {loading ? (
                    <p className="appointment-loading" role="status">Loading appointments...</p>
                ) : error && appointments.length === 0 ? null : matchingAppointments.length > 0 ? (
                    <>
                    <div className="task-list">
                        {paginatedAppointments.map((appointment) => {
                            const appointmentDate = appointment.date?.slice(0, 10);
                            const taskDate = appointmentDate ? new Date(`${appointmentDate}T00:00:00`) : null;
                            const isPast = appointmentDate && appointmentDate < today;
                            const isCompleted = appointment.status === "completed";
                            return (
                                <article className={`task-row${isCompleted ? " task-row-completed" : ""}`} key={appointment.id}>
                                    {isCompleted
                                        ? <span className="task-row-mark task-row-mark-completed" aria-label="Completed"><i className="bi bi-check"></i></span>
                                        : <span className="task-row-mark" aria-hidden="true"></span>}
                                    <div className="task-row-main">
                                        <h3>{appointment.title}</h3>
                                        <p>{appointment.description || "No description added."}</p>
                                        {isAdmin && <span className="appointment-owner">
                                            <i className="bi bi-person"></i>
                                            {appointment.user_name || appointment.user_id}
                                            {appointment.user_name && <span> · {appointment.user_id}</span>}
                                        </span>}
                                    </div>
                                    {isAdmin ? (
                                        <label className="appointment-status-control">
                                            <span className="visually-hidden">Status for {appointment.title}</span>
                                            <select
                                                className={`appointment-status-select${isCompleted ? " appointment-status-completed" : ""}`}
                                                value={appointment.status === "completed" ? "completed" : "pending"}
                                                disabled={updatingAppointmentId === appointment.id}
                                                onChange={(event) => updateStatus(appointment, event.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </label>
                                    ) : (
                                        <span className={`appointment-status${isCompleted ? " appointment-status-completed" : ""}`}>
                                            {isCompleted ? "Completed" : "Pending"}
                                        </span>
                                    )}
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
                    {pageCount > 1 && (
                        <nav className="appointment-pagination" aria-label="Appointment pages">
                            <span>Showing {(displayedPage - 1) * PAGE_SIZE + 1}–{Math.min(displayedPage * PAGE_SIZE, matchingAppointments.length)} of {matchingAppointments.length}</span>
                            <div>
                                <button
                                    type="button"
                                    className="pagination-button"
                                    aria-label="Previous page"
                                    disabled={displayedPage === 1}
                                    onClick={() => setPagination({ page: displayedPage - 1, searchTerm })}
                                ><i className="bi bi-chevron-left"></i> Previous</button>
                                <span className="pagination-page">Page {displayedPage} of {pageCount}</span>
                                <button
                                    type="button"
                                    className="pagination-button"
                                    aria-label="Next page"
                                    disabled={displayedPage === pageCount}
                                    onClick={() => setPagination({ page: displayedPage + 1, searchTerm })}
                                >Next <i className="bi bi-chevron-right"></i></button>
                            </div>
                        </nav>
                    )}
                    </>
                ) : (
                    <div className="empty-state">
                        <span className="empty-state-icon"><i className={searchTerm ? "bi bi-search" : activeFilter === "completed" ? "bi bi-check2-circle" : "bi bi-calendar2-week"}></i></span>
                        <h3>{searchTerm ? "No matching appointments" : activeFilter === "completed" ? "Nothing completed yet" : activeFilter === "upcoming" ? "No upcoming appointments" : activeFilter === "pending" ? "No pending appointments" : "Your schedule is clear"}</h3>
                        <p>{searchTerm ? "Try a different search or clear your search field." : activeFilter === "all" ? "Add an appointment to keep your plans organized." : "Appointments in this category will appear here."}</p>
                        {!searchTerm && activeFilter === "all" && <Link to="/dashboard/add" className="button button-primary"><i className="bi bi-plus-lg"></i> Add an appointment</Link>}
                    </div>
                )}
            </section>
            </div>
    );
}
