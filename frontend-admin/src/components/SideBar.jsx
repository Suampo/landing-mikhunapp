import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCallback } from "react";
import {
  Home,
  List,
  Utensils,
  ShoppingCart,
  Boxes,
  TrendingUp,
  LogOut,        // 👈 añade esto
} from "lucide-react";

export default function SideBar({ open, setOpen }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const menus = [
  { name: "Inicio",     icon: <Home size={20} />,        link: "/dashboard" },
  { name: "Mesas",      icon: <List size={20} />,        link: "/mesas" },
  { name: "Menú",       icon: <Utensils size={20} />,    link: "/menu" },
  { name: "Pedidos",    icon: <ShoppingCart size={20} />,link: "/pedidos" },
  { name: "Inventario", icon: <Boxes size={20} />,       link: "/inventario" }, // nuevo
  { name: "Reportes",   icon: <TrendingUp size={20} />,  link: "/reportes" },   // nuevo
];

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate]);

  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 767px)").matches) setOpen(false);
  };

  return (
    <>
      {/* Overlay (solo móvil) */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={[
          // Siempre FIXED para desktop también
          "fixed inset-y-0 left-0 z-40 h-[100svh] w-64 bg-gray-900 text-white shadow-lg",
          // Drawer en móvil (entra/sale). En desktop siempre visible.
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
      >
        {/* Cabecera móvil con botón cerrar */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden">
          <span className="text-sm font-semibold tracking-wide">Restaurante</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg border border-white/20 px-3 py-1.5"
          >
            Cerrar
          </button>
        </div>

        {/* Cabecera desktop (sin chevron; fijo y abierto) */}
        <div className="hidden items-center justify-between px-4 py-3 md:flex">
          <span className="text-sm font-semibold tracking-wide">Restaurante</span>
        </div>

        {/* Menú */}
        <nav className="mt-2 flex h-[calc(100svh-112px)] flex-col gap-3 overflow-y-auto px-3">
          {menus.map((item) => {
            const active = pathname === item.link;
            return (
              <Link
                key={item.link}
                to={item.link}
                onClick={closeOnMobile}
                className={[
                  "flex items-center gap-4 rounded-xl px-4 py-2 transition hover:bg-white/10",
                  active ? "bg-white/10 border-l-2 border-blue-400" : "text-gray-300",
                ].join(" ")}
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Cerrar sesión */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={() => {
              closeOnMobile();
              handleLogout();
            }}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/10 hover:text-red-100"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
