import { Link } from "react-router-dom";

export default function Nav({ onLogout, user }) {
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
