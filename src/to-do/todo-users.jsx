import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const API_URL = "http://localhost:3000";

export function TodoUsers() {
    const [cookies] = useCookies(["userid"]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingUserId, setSavingUserId] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;

        async function loadUsers() {
            setError("");
            try {
                const response = await axios.get(`${API_URL}/users`);
                if (active) {
                    setUsers(response.data);
                }
            } catch (requestError) {
                console.error("Unable to load users:", requestError);
                if (active) {
                    setError("Unable to load users. Please check whether the API server is running.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadUsers();
        return () => {
            active = false;
        };
    }, []);

    async function updateRole(user, role) {
        setError("");
        setMessage("");
        setSavingUserId(user.id);
        try {
            const response = await axios.patch(`${API_URL}/users/${user.id}`, { role });
            setUsers((currentUsers) => currentUsers.map((currentUser) => (
                currentUser.id === user.id ? response.data : currentUser
            )));
            setMessage(`Role updated for ${user.user_name || user.user_id}.`);
        } catch (requestError) {
            console.error("Unable to update user role:", requestError);
            setError(`Unable to update the role for ${user.user_name || user.user_id}. Please try again.`);
        } finally {
            setSavingUserId("");
        }
    }

    return (
        <section className="admin-users-page">
            <div className="task-list-card">
                <div className="task-list-header">
                    <div>
                        <h2>Users &amp; roles</h2>
                        <p>Assign user or administrator access to registered accounts.</p>
                    </div>
                    <span className="task-count">{users.length} {users.length === 1 ? "user" : "users"}</span>
                </div>
                {error && <div className="alert alert-danger m-3" role="alert">{error}</div>}
                {message && <div className="alert alert-success m-3" role="status">{message}</div>}
                {loading ? (
                    <p className="appointment-loading" role="status">Loading users...</p>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-state-icon"><i className="bi bi-people"></i></span>
                        <h3>No registered users</h3>
                        <p>Registered accounts will appear here.</p>
                    </div>
                ) : (
                    <div className="admin-user-list">
                        {users.map((user) => {
                            const isCurrentUser = user.user_id === cookies.userid;
                            return (
                                <article className="admin-user-row" key={user.id}>
                                    <span className="admin-user-avatar" aria-hidden="true">
                                        {user.user_name?.charAt(0) || user.user_id?.charAt(0) || "U"}
                                    </span>
                                    <div className="admin-user-info">
                                        <strong>{user.user_name || "Unnamed user"}</strong>
                                        <span>{user.user_id} · {user.email}</span>
                                    </div>
                                    <label className="admin-role-control">
                                        <span className="visually-hidden">Role for {user.user_name || user.user_id}</span>
                                        <select
                                            className="form-select"
                                            value={user.role === "admin" ? "admin" : "user"}
                                            disabled={isCurrentUser || savingUserId === user.id}
                                            onChange={(event) => updateRole(user, event.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </label>
                                    {isCurrentUser && <span className="admin-self-label">You</span>}
                                    {savingUserId === user.id && <span className="admin-saving-label" role="status">Saving…</span>}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
