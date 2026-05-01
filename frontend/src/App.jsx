import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import DashboardPage from "./components/DashboardPage";
import ProjectsPage from "./components/ProjectsPage";
import ProjectDetailPage from "./components/ProjectDetailPage";
import Nav from "./components/Nav";
import { authToken, authUser } from "./api";

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
              <ProjectsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <RequireAuth>
              <ProjectDetailPage />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
