import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import fetchJson from "../api";

export default function DashboardPage({ user }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJson("/tasks/dashboard/")
      .then((data) => setDashboard(data))
      .catch((err) => setError(err.detail || "Could not load dashboard"));
  }, []);

  if (error)
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  if (!dashboard) return <div className="page">Loading dashboard...</div>;

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {user?.role === "ADMIN" && (
        <div className="admin-actions">
          <p>As an admin, you can add projects and tasks from Projects.</p>
          <button onClick={() => navigate("/projects")}>Go to Projects</button>
        </div>
      )}
      <div className="stats-grid">
        <div className="stat-card">To Do: {dashboard.counts.TODO}</div>
        <div className="stat-card">In Progress: {dashboard.counts.IN_PROGRESS}</div>
        <div className="stat-card">Done: {dashboard.counts.DONE}</div>
        <div className="stat-card overdue">Overdue: {dashboard.counts.overdue}</div>
      </div>
      <section>
        <h2>Recent Tasks</h2>
        <div className="task-list">
          {dashboard.tasks.map((task) => (
            <div key={task.id} className="task-card">
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <small>
                {task.status} | Due: {task.due_date || "No due date"}
              </small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
