import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import fetchJson from "../api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmails, setMemberEmails] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadProjects = () => {
    fetchJson("/projects/")
      .then((data) => setProjects(data.projects || []))
      .catch((err) => setError(err.detail || "Could not load projects"));
  };

  useEffect(() => {
    loadProjects();
    fetchJson("/users/")
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const data = await fetchJson("/projects/", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          member_emails: memberEmails,
        }),
      });
      setProjects((prev) => [data, ...(prev || [])]);
      setName("");
      setDescription("");
      setMemberEmails([]);
    } catch (err) {
      setError(err.detail || "Could not create project");
    }
  };

  const startEdit = (project) => {
    setEditId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || "");
  };

  const saveEdit = async (projectId) => {
    setError(null);
    try {
      const data = await fetchJson(`/projects/${projectId}/`, {
        method: "PUT",
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      setProjects((prev) =>
        prev.map((project) => (project.id === projectId ? data : project)),
      );
      setEditId(null);
    } catch (err) {
      setError(err.detail || "Could not update project");
    }
  };

  const deleteProject = async (projectId) => {
    setError(null);
    try {
      await fetchJson(`/projects/${projectId}/`, { method: "DELETE" });
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      setError(err.detail || "Could not delete project");
    }
  };

  if (error)
    return (
      <div className="page">
        <p className="error">{error}</p>
      </div>
    );
  if (!projects) return <div className="page">Loading projects...</div>;

  return (
    <div className="page">
      <h1>Projects</h1>
      <form className="project-form" onSubmit={createProject}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <label>Assign Members</label>
        <select
          multiple
          value={memberEmails}
          onChange={(e) =>
            setMemberEmails(
              Array.from(e.target.selectedOptions, (option) => option.value),
            )
          }
          size={Math.min(6, users.length || 3)}
        >
          {users.map((user) => (
            <option key={user.id} value={user.email}>
              {user.email}
            </option>
          ))}
        </select>
        <button type="submit">Create project</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="project-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            {editId === project.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="project-actions">
                  <button type="button" onClick={() => saveEdit(project.id)}>
                    Save
                  </button>
                  <button type="button" onClick={() => setEditId(null)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <small>Owner: {project.owner.email}</small>
                <p>Members: {project.members.length}</p>
                <div className="project-actions">
                  <Link to={`/projects/${project.id}`}>View</Link>
                  <button type="button" onClick={() => startEdit(project)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProject(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
