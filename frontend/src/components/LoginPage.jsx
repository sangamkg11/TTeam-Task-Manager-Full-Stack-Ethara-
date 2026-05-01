import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import fetchJson from "../api";

export default function LoginPage({ onAuth }) {
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
    <div className="auth-layout">
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
    </div>
  );
}
