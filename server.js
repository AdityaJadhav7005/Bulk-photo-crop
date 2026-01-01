import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import connectDB from "./db.js";
import paymentRoutes from "./routes/payment.js";

app.use(express.json()); // VERY IMPORTANT
app.use("/api", paymentRoutes);


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ES module support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api", paymentRoutes);

// serve static files
app.use(express.static(path.join(__dirname, "public")));

// root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
