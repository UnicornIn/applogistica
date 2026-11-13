
import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRouter from "./routes/health.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRouter);

export default app;
