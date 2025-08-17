import QRCode from "qrcode";
import fs from "fs";

// 🔹 Cambia por tu URL base de frontend
const BASE_URL = "http://localhost:5173"; 

// 🔹 Datos simulados de mesas
const mesas = [
  { id: 1, restaurantId:1 },
  { id: 2, restaurantId:1},
  { id: 3, restaurantId:1},
];

async function generarQR() {
  for (const mesa of mesas) {
    const url = `${BASE_URL}/?mesaId=${mesa.id}&restaurantId=${mesa.restaurantId}`;
    const fileName = `mesa_${mesa.id}.png`;

    await QRCode.toFile(fileName, url, {
      color: { dark: "#000", light: "#FFF" },
      width: 300,
    });

    console.log(`✅ QR generado para mesa ${mesa.id}: ${url} -> ${fileName}`);
  }
}

generarQR();