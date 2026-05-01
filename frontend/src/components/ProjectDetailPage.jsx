import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchJson from "../api";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [task, setTask] = useState({
    title: "",
    description: "",
    due_date: "",
    assignee_id: "",
  });

  const loadProject = () => {
    fetchJson(`/projects/${id}/`)
      .then((data) => setProject(data))
      .catch((err) => setError(err.detail || "Could not load project"));
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const addMember = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await fetchJson(`/projects/${id}/members/`, {
        method: "POST",
        body: JSON.stringify({ email: memberEmail }),
      });
      setMemberEmail("");
      loadProject();
    } catch (err) {
      setError(err.detail || err.email || "Could not add member");
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await fetchJson("/tasks/", {
        method: "POST",
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          due_date: task.due_date || null,
          project: Number(id),
          assignee_id: task.assignee_id ? Number(task.assignee_id) : null,
        }),
      });
      setTask({ title: "", description: "", due_date: "", assignee_id: "" });
      loadProject();
    } catch (err) {
      setError(err.detail || JSON.stringify(err) || "Could not create task");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    setError(null);
    try {
      await fetchJson(`/tasks/${taskId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      loadProject();
    } catch (err) {
      setError(err.detail || "Could not update task");
    }
  };

  const deleteTask = async (taskId) => {
    setError(null);
    try {
      await fetchJson(`/tasks/${taskId}/`, { method: "DELETE" });
      loadProject();
    } catch (err) {
      setError(err.detail || "Could not delete task");
    }
  };

  if (error)
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  if (!project) return <div className="page">Loading project...</div>;

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate("/projects")}>
        Back to projects
      </button>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <section>
        <h2>Members</h2>
        <ul>
          {project.members.map((member) => (
            <li key={member.id}>{member.email}</li>
          ))}
        </ul>
        <form className="project-form" onSubmit={addMember}>
          <input
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="Member email"
            required
          />
          <button type="submit">Add member</button>
        </form>
      </section>
      <section>
        <h2>Tasks</h2>
        <form className="project-form" onSubmit={createTask}>
          <input
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            placeholder="Task title"
            required
          />
          <input
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            placeholder="Task description"
          />
          <input
            type="date"
            value={task.due_date}
            onChange={(e) => setTask({ ...task, due_date: e.target.value })}
          />
          <label>Assignee</label>
          <select
            value={task.assignee_id}
            onChange={(e) => setTask({ ...task, assignee_id: e.target.value })}
          >
            <option value="">Unassigned</option>
            {project.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.email}
              </option>
            ))}
          </select>
          <button type="submit">Create task</button>
        </form>
        <div className="task-list">
          {project.tasks.map((taskItem) => (
            <div key={taskItem.id} className="task-card">
              <strong>{taskItem.title}</strong>
              <p>{taskItem.description}</p>
              <small>
                Status: {taskItem.status} | Assignee:{" "}
                {taskItem.assignee?.email || "Unassigned"}
              </small>
              <div className="task-actions">
                <select
                  value={taskItem.status}
                  onChange={(e) =>
                    updateTaskStatus(taskItem.id, e.target.value)
                  }
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
                <button type="button" onClick={() => deleteTask(taskItem.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
