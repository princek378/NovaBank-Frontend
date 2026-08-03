import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Not logged in → send to homepage
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Wrong role → send to homepage
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
