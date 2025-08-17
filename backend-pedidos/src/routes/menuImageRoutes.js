import { Router } from "express";
import multer from "multer";
import { uploadMenuImage } from "../controllers/menuImageController.js";
import { authTenant } from "../middlewares/authTenant.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/:id/upload-image", authTenant, upload.single("image"), uploadMenuImage);

export default router;