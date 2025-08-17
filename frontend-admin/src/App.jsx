import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import Mesas from "./pages/Mesas";
import Menu from "./pages/Menu";
import Pedidos from "./pages/Pedidos";
import Configuracion from "./pages/Configuracion";
import Login from "./pages/Login";

function ProtectedRoute() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppLayout() {
  const [open, setOpen] = useState(false);

  // Fuerza: en desktop SIEMPRE abierto; en móvil cerrado por defecto
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = (e) => setOpen(e.matches ? true : false);
    sync(mq);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header solo móvil */}
      <header className="sticky top-0 z-40 flex items-center gap-2 bg-white px-4 py-3 shadow md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border px-3 py-2 text-gray-700"
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <div className="font-semibold">Restaurante</div>
      </header>

      <div className="relative flex">
        <Sidebar open={open} setOpen={setOpen} />

        {/* Spacer fijo SOLO en desktop para respetar el ancho del sidebar */}
        <div className="hidden w-64 shrink-0 md:block" />

        <main className="flex-1 px-3 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mesas" element={<Mesas />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
