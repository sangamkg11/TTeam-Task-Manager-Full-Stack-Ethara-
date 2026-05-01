import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import fetchJson from "../api";

export default function SignupPage({ onAuth }) {
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
        err?.detail || err?.email?.[0] || err?.username?.[0] ||
          JSON.stringify(err) ||
          "Registration failed",
      );
    }
  };

  return (
    <div className="auth-layout">
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
    </div>
  );
}
