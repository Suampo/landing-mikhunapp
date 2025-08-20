import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MenuCtx = createContext(null);

export function MenuProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);
  const [error, setError] = useState("");

  const params = new URLSearchParams(location.search);
  const restaurantId = Number(params.get("restaurantId") || 1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE}/api/menu/public?restaurantId=${restaurantId}`);
        setCategories(Array.isArray(data?.categories) ? data.categories : []);
        setCombos(Array.isArray(data?.combos) ? data.combos : []);
        setError("");
      } catch (e) {
        setError(e?.message || "No se pudo cargar el menú");
        setCategories([]); setCombos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  const value = useMemo(() => ({ loading, error, categories, combos, restaurantId }), [loading, error, categories, combos, restaurantId]);
  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>;
}

export function useMenuPublic() {
  const ctx = useContext(MenuCtx);
  if (!ctx) throw new Error("useMenuPublic debe usarse dentro de <MenuProvider>");
  return ctx;
}
