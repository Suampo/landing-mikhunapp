import { useState } from "react";

export default function MesasHeader({ onAdd, adding, query, setQuery }) {
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const cod = codigo.trim();
    if (!cod) return alert("Ingresa un código para la mesa");
    await onAdd({ codigo: cod, descripcion: descripcion.trim() }); // 👈 OBJETO
    setCodigo("");
    setDescripcion("");
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mesas</h2>
          <p className="text-sm text-neutral-500">
            Crea, busca y administra tus mesas.
          </p>
        </div>
        <input
          className="w-full max-w-xs rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-blue-500"
          placeholder="Buscar por código o descripción…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <form
        onSubmit={submit}
        className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr,2fr,auto]">
          <input
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-blue-500"
            placeholder="Código (ej: MESA-1)"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <input
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none transition focus:border-blue-500"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? "Agregando..." : "Agregar mesa"}
          </button>
        </div>
      </form>
    </>
  );
}
