// src/pages/Menu.jsx
import MenuHeader from "../components/MenuHeader";
import MenuCard from "../components/MenuCard";
import MenuItemEdit from "../components/MenuItemEdit";
import CategoriesManager from "../components/CategoriesManager";
import ComboManager from "../components/ComboManager";
import useMenuItems from "../hooks/useMenuItems";
import { useMemo, useState } from "react";

export default function Menu() {
  const {
    pageItems, query, setQuery, loading,
    editing, creating, openCreate, openEdit, closeModal,
    saveItem, deleteItem, filtered, toggleActive,
    limit, setLimit, page, setPage,
  } = useMenuItems();

  const [categories, setCategories] = useState([]);

  // id -> nombre para chips y selects
  const catNameById = useMemo(
    () => Object.fromEntries((categories || []).map((c) => [c.id, c.nombre])),
    [categories]
  );

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-7xl px-4">
        <MenuHeader query={query} setQuery={setQuery} onCreate={openCreate} />

        {/* Gestor de categorías: emite onChange(categorías) */}
        <div className="mb-6">
          <CategoriesManager onChange={setCategories} />
        </div>

        {/* Gestor de combos (usa categorías actuales) */}
        <div className="mb-6">
          <ComboManager cats={categories} />
        </div>

        {/* GRID de platos */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5">
                <div className="h-52 bg-neutral-200" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 bg-neutral-200" />
                  <div className="h-3 w-full bg-neutral-200" />
                  <div className="h-3 w-5/6 bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-neutral-600">
            No hay platos que coincidan.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((it) => {
              // tolera snake_case o camelCase
              const catId = it.categoria_id ?? it.categoriaId;
              return (
                <MenuCard
                  key={it.id}
                  item={it}
                  categoryName={catNameById[catId] || "Sin categoría"}
                  onEdit={openEdit}
                  onDelete={deleteItem}
                  onToggleActive={toggleActive}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold">
                {creating ? "Crear plato" : "Editar plato"}
              </h3>
            </div>
            <div className="p-4">
              <MenuItemEdit item={editing} onSave={saveItem} categorias={categories} />
            </div>
            <div className="flex justify-end gap-2 border-t p-3">
              <button
                className="rounded-lg px-4 py-2 text-sm hover:bg-neutral-100"
                onClick={closeModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
