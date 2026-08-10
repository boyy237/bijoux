import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth.js";
import { uploadImageBuffer } from "../services/cloudinary.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    cb(ok ? null : new Error("Format d'image non supporté."), ok);
  },
});

router.post("/", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu." });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({
      error: "Cloudinary n'est pas configuré. Renseigne CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans .env.",
    });
  }

  try {
    const result = await uploadImageBuffer(req.file.buffer);
    res.status(201).json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: "Échec de l'import de l'image." });
  }
});

export default router;
