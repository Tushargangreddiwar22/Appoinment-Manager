import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";

const benefits = [
    { icon: "bi-calendar2-week", title: "See your schedule", text: "Keep upcoming appointments easy to find." },
    { icon: "bi-pencil-square", title: "Stay prepared", text: "Keep the details you need right at hand." },
    { icon: "bi-bell", title: "Never lose track", text: "Know what’s coming up and when." }
];

export function TodoHome() {
    const [cookies] = useCookies(["userid"]);

    return (
        <div className="landing-page">
            <section className="landing-hero">
                <div className="hero-copy">
                    <span className="eyebrow"><span className="eyebrow-dot"></span> A clearer way to manage your schedule</span>
                    <h1>Your appointments,<br /><span>all in one place.</span></h1>
                    <p className="hero-description">
                        Keep track of meetings, visits, and the plans that make up your day.
                        Add the details, set a date, and always know what’s next.
                    </p>
                    <div className="hero-actions">
                        {cookies.userid ? (
                            <Link to="/dashboard" className="button button-primary">
                                View my appointments <i className="bi bi-arrow-right"></i>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="button button-primary">
                                    Get started <i className="bi bi-arrow-right"></i>
                                </Link>
                                <Link to="/login" className="button button-quiet">I already have an account</Link>
                            </>
                        )}
                    </div>
                    <div className="hero-note">
                        <span className="note-check"><i className="bi bi-check"></i></span>
                        <span>Your schedule, clear and up to date.</span>
                    </div>
                </div>
                <div className="hero-visual" aria-label="A preview of your appointment schedule">
                    <div className="visual-glow"></div>
                    <div className="preview-card">
                        <div className="preview-top">
                            <div>
                                <span className="preview-label">YOUR UPCOMING SCHEDULE</span>
                                <h2>Appointments at a glance</h2>
                            </div>
                            <span className="preview-more"><i className="bi bi-three-dots"></i></span>
                        </div>
                        <div className="preview-tasks">
                            <div className="preview-task">
                                <span className="appointment-day"><strong>Today</strong><small>OCT 26</small></span>
                                <span><strong>Annual health check</strong><small>Dr. Morgan · City Health Clinic</small></span>
                                <span className="task-tag">Visit</span>
                            </div>
                            <div className="preview-task">
                                <span className="appointment-day"><strong>Today</strong><small>OCT 26</small></span>
                                <span><strong>Project planning meeting</strong><small>Conference room · 30 min</small></span>
                                <span className="task-tag task-tag-soft">Meeting</span>
                            </div>
                            <div className="preview-task">
                                <span className="appointment-day"><strong>Wed</strong><small>OCT 28</small></span>
                                <span><strong>Lunch with Alex</strong><small>Olive & Thyme · Downtown</small></span>
                                <span className="task-tag task-tag-soft">Personal</span>
                            </div>
                            <div className="preview-task">
                                <span className="appointment-day"><strong>Fri</strong><small>OCT 30</small></span>
                                <span><strong>Dental cleaning</strong><small>Bright Smile Dental</small></span>
                                <span className="task-tag">Visit</span>
                            </div>
                        </div>
                        <div className="preview-footer"><i className="bi bi-calendar-check"></i> Your schedule is looking good.</div>
                    </div>
                    <div className="floating-note"><span><i className="bi bi-calendar2-check"></i></span><div><strong>Plan with confidence</strong><small>Everything in its place.</small></div></div>
                </div>
            </section>
            <section className="benefits-section">
                <div className="section-intro">
                    <span className="eyebrow">YOUR TIME, WELL ORGANIZED</span>
                    <h2>Every appointment, right where you need it.</h2>
                </div>
                <div className="benefit-grid">
                    {benefits.map((benefit, index) => (
                        <article className="benefit-card" key={benefit.title}>
                            <span className={`benefit-icon benefit-icon-${index}`}><i className={`bi ${benefit.icon}`}></i></span>
                            <h3>{benefit.title}</h3>
                            <p>{benefit.text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
