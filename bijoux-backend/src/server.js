import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { attachSession } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import categoriesRoutes from "./routes/categories.js";
import productsRoutes from "./routes/products.js";
import uploadRoutes from "./routes/upload.js";
import clientsRoutes from "./routes/clients.js";
import ordersRoutes from "./routes/orders.js";
import shippingRoutes from "./routes/shipping.js";
import paymentsRoutes from "./routes/payments.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(attachSession);

app.get("/", (req, res) => res.json({ status: "ok", service: "bijoux-pro-backend" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/payments", paymentsRoutes);

// Gestion d'erreurs générique (ex: fichier trop volumineux via multer)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Erreur serveur." });
});

const PORT = process.env.PORT || 4400;
app.listen(PORT, () => {
  console.log(`✓ Backend Bijoux Pro démarré sur http://localhost:${PORT}`);
});
