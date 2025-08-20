// src/routes/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import API from "../services/axiosInstance";

export default function ProtectedRoute() {
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setChecked(true);
      setOk(false);
      return;
    }
    API.get("/auth/validate-token")
      .then(() => setOk(true))
      .catch(() => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setOk(false);
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return <div className="p-4 text-sm text-neutral-500">Verificando sesión…</div>;
  }

  if (!ok) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  return <Outlet />;
}
