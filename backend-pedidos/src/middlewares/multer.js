import multer from "multer";
import { fileTypeFromBuffer } from "file-type";

const storage = multer.memoryStorage();

const mimeAllow = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const fileFilter = async (req, file, cb) => {
  try {
    if (!mimeAllow.includes(file.mimetype)) return cb(new Error("Tipo MIME no permitido"), false);
    // Verifica firma real
    const buf = file.buffer || Buffer.alloc(0);
    const ft = await fileTypeFromBuffer(buf);
    if (!ft || !mimeAllow.includes(ft.mime)) return cb(new Error("Archivo no es imagen válida"), false);
    cb(null, true);
  } catch (e) {
    cb(new Error("No se pudo validar el archivo"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
