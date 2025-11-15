import express from "express";

import {
  requestId,
  helmetConfig,
  requestLogger,
  securityMiddleware,
  compressionMiddleware,
} from "@/middleware/security";
import appRouter from "@/routes/router";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";

// Create Express app
const app: express.Application = express();

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Security middleware
app.use(helmetConfig);
app.use(requestId);
app.use(requestLogger);
app.use(securityMiddleware);
app.use(compressionMiddleware);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Mount routes
app.use("/api/v1", appRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
