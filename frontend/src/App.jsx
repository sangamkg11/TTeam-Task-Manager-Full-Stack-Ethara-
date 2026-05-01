import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = "/api";

const authToken = () => localStorage.getItem("ttm_token");
const authUser = () => JSON.parse(localStorage.getItem("ttm_user") || "null");

function fetchJson(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authToken()) {
    headers.Authorization = `Bearer ${authToken()}`;
  }
  return fetch(`${API_URL}${path}`, { ...options, headers }).then(
    async (res) => {
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw data || { detail: "Request failed" };
      return data;
    },
  );
}

function AuthLayout({ children }) {
  return <div className="auth-layout">{children}</div>;
}

function LoginPage({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const data = await fetchJson("/auth/login/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("ttm_token", data.access);
      localStorage.setItem("ttm_user", JSON.stringify(data.user));
      onAuth(data.access, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.detail ||
          err?.non_field_errors?.[0] ||
          err?.email?.[0] ||
          err?.username?.[0] ||
          JSON.stringify(err) ||
          "Login failed",
      );
    }
  };

  return (
    <AuthLayout>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Don&apos;t have an account? <Link to="/signup">Signup</Link>
      </p>
    </AuthLayout>
  );
}

function SignupPage({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "MEMBER",
  });
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const data = await fetchJson("/auth/register/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("ttm_token", data.access);
      localStorage.setItem("ttm_user", JSON.stringify(data.user));
      onAuth(data.access, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.detail ||
          err?.email?.[0] ||
          err?.username?.[0] ||
          JSON.stringify(err) ||
          "Registration failed",
      );
    }
  };

  return (
    <AuthLayout>
      <h1>Signup</h1>
      <form onSubmit={submit}>
        <label>Name</label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <label>Role</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit">Create account</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}

function DashboardPage({ user }) {
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
        <div className="stat-card">
          In Progress: {dashboard.counts.IN_PROGRESS}
        </div>
        <div className="stat-card">Done: {dashboard.counts.DONE}</div>
        <div className="stat-card overdue">
          Overdue: {dashboard.counts.overdue}
        </div>
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

function ProjectsPage() {
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

function Nav({ onLogout, user }) {
  return (
    <nav className="topbar">
      <div className="nav-left">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
      </div>
      <div className="nav-right">
        {user && <span className="role-badge">{user.role}</span>}
        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

function ProjectDetailPage() {
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
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState("");

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

function RequireAuth({ children }) {
  if (!authToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [token, setToken] = useState(authToken());
  const [user, setUser] = useState(authUser());

  const handleAuth = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
  };

  const logout = () => {
    localStorage.removeItem("ttm_token");
    localStorage.removeItem("ttm_user");
    setToken(null);
    setUser(null);
  };

  return (
    <div className="app-shell">
      {token && <Nav onLogout={logout} user={user} />}
      <Routes>
        <Route path="/login" element={<LoginPage onAuth={handleAuth} />} />
        <Route path="/signup" element={<SignupPage onAuth={handleAuth} />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/projects"
          element={
            <RequireAuth>
              <ProjectsPage user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <RequireAuth>
              <ProjectDetailPage user={user} />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
