import PDFDocument from "pdfkit";
import fs from "fs";

const printedCache = new Map(); // orderId -> ts (anti-duplicado simple)
let printFn = null;

// Carga perezosa y compatible de pdf-to-printer (CJS/ESM)
async function getPrint() {
  if (printFn) return printFn;
  const mod = await import("pdf-to-printer"); // CJS -> viene como default
  const maybeDefault = mod.default || mod;     // por si cambia
  const fn = maybeDefault.print || mod.print;  // soporta ambos casos
  if (typeof fn !== "function") {
    throw new Error("No se encontró la función 'print' en pdf-to-printer");
  }
  printFn = fn;
  return printFn;
}

export const imprimirTicket = async (pedido) => {
  // Si no quieres imprimir en algunos entornos, respeta PRINT_SERVER
  if (process.env.PRINT_SERVER !== "true") return;

  // Anti-duplicado (60s)
  const last = printedCache.get(pedido.id);
  if (last && Date.now() - last < 60_000) return;
  printedCache.set(pedido.id, Date.now());
  setTimeout(() => printedCache.delete(pedido.id), 120_000);

  const fileName = `ticket_${pedido.id}.pdf`;

  // Genera el PDF
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 5, size: [165, 500] });
    const stream = fs.createWriteStream(fileName);
    doc.pipe(stream);

    doc.fontSize(12).text("🍽 Restaurante QR", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Pedido #${pedido.id}`);
    doc.text(`Mesa: ${pedido.mesa}`);
    doc.text(`Estado: ${pedido.estado}`);
    doc.moveDown();

    (pedido.items || []).forEach((it) => {
      doc.fontSize(9).text(`${it.cantidad}x ${it.nombre}  S/ ${it.precio_unitario}`);
    });

    doc.moveDown();
    doc.fontSize(11).text(`Total: S/ ${pedido.monto}`, { align: "right" });
    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  // Imprime
  try {
    const print = await getPrint();
    await print(fileName);
    console.log("✅ Ticket enviado a impresora");
  } catch (e) {
    console.error("❌ Error imprimiendo ticket:", e.message);
  }
};
