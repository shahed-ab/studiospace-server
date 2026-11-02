import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandlers.js";
import { verifyJWT } from "./middleware/verifyJWT.js";
import authRoutes from "./routes/authRoutes.js";
import studioRoutes from "./routes/studioRoutes.js";
import { myStudios } from "./controllers/studioController.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy (required for secure cookies behind Vercel / reverse proxies)
app.set("trust proxy", 1);

// Allow credentials from every origin listed in CLIENT_URL (comma-separated)
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server calls (no Origin header) and listed origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// Ensure the DB is connected before every request (lazy cached connection)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health check routes
app.get("/", (req, res) => res.json({ status: "ok", service: "studiospace-api" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// API routes
app.use("/api/auth",    authRoutes);
app.use("/api/studios", studioRoutes);
app.get("/api/my-studios", verifyJWT, myStudios);

// 404 and error handlers must come after all routes
app.use(notFound);
app.use(errorHandler);

// Vercel: export the app; listen only when running locally
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
