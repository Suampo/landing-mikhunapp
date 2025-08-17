// frontend-admin/src/hooks/useMenuItems.js
import { useEffect, useMemo, useState } from "react";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItemApi,
  uploadMenuItemImage,
} from "../services/menuApi";

export default function useMenuItems() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMenuItems();
      const rows = Array.isArray(data) ? data : data?.data || [];
      setItems(rows.filter((r) => r.activo !== false));
    } catch (e) {
      console.error("getMenuItems:", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing({}); setCreating(true); };
  const openEdit   = (item) => { setEditing(item); setCreating(false); };
  const closeModal = () => { setEditing(null); setCreating(false); };

  const saveItem = async ({ nombre, precio, descripcion, imagen, categoriaId }) => {
    try {
      let id;
      if (editing?.id) {
        await updateMenuItem(editing.id, { nombre, precio, descripcion, categoriaId });
        id = editing.id;
      } else {
        const created = await createMenuItem({ nombre, precio, descripcion, categoriaId });
        id = created?.id ?? created?.item?.id;
        if (!id) throw new Error("El servidor no devolvió el ID del nuevo ítem");
      }

      if (imagen) {
        await uploadMenuItemImage(id, imagen); // FormData('image', file)
      }

      await load();
      closeModal();
    } catch (e) {
      console.error("saveItem:", e?.response?.data || e.message);
      alert(
        typeof e?.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : (e.response?.data || e.message)
      );
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteMenuItemApi(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error("deleteItem:", e?.response?.data || e.message);
    }
  };

  const toggleActive = async (it) => {
    try {
      await updateMenuItem(it.id, { activo: !it.activo });
      setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, activo: !x.activo } : x)));
    } catch (e) {
      console.error("toggleActive:", e?.response?.data || e.message);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.nombre?.toLowerCase().includes(q) ||
        it.descripcion?.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => { setPage(1); }, [query]);

  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageItems = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  useEffect(() => { if (page > pages) setPage(pages); }, [pages, page]);

  return {
    items, filtered, pageItems,
    query, setQuery, loading,
    editing, creating,
    page, setPage, limit, setLimit,
    openCreate, openEdit, closeModal,
    saveItem, deleteItem,
    toggleActive,
  };
}
