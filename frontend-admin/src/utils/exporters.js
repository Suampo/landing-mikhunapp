// src/utils/exporters.js
import * as XLSX from "xlsx";

/** Exporta a CSV (compatible con Excel, incluye BOM) */
export function downloadCSV(filename, rows, columns) {
  // rows: array de objetos
  // columns: [{ key: "id", title: "ID" }, ...]  (opcional)
  if (!Array.isArray(rows) || rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const cols = columns && columns.length
    ? columns
    : Object.keys(rows[0]).map(k => ({ key: k, title: k }));

  const header = cols.map(c => c.title);
  const data = rows.map(r =>
    cols.map(c => {
      const v = getDeep(r, c.key);
      // Escapar comillas y forzar texto
      return `"${String(v ?? "").replace(/"/g, '""')}"`;
    }).join(",")
  );

  // BOM para que Excel respete UTF-8
  const csv = "\uFEFF" + [header.join(","), ...data].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = ensureExt(filename, ".csv");
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Exporta a XLSX (SheetJS) */
export function downloadXLSX(filename, rows, sheetName = "Datos", columns) {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  let data = rows;
  if (columns && columns.length) {
    // Re-map a objetos con títulos de columna como claves
    data = rows.map(r => {
      const obj = {};
      for (const col of columns) obj[col.title] = getDeep(r, col.key);
      return obj;
    });
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, ensureExt(filename, ".xlsx"));
}

/** Helpers */
function ensureExt(name, ext) {
  return name?.toLowerCase().endsWith(ext) ? name : `${name}${ext}`;
}
function getDeep(obj, path) {
  // permite "cliente.nombre" como key
  if (!path || !obj) return undefined;
  return String(path).split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}
