import express from "express";

import {
  securityMiddleware,
  rateLimiter,
  requestLogger,
  requestId,
  helmetConfig,
  compressionMiddleware,
} from "@/middleware/security";
import logger from "@/utils/logger";
import { config } from "@/config";
import appRouter from "@/routes/router";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";

// Create Express app
const app: express.Application = express();

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Security middleware
app.use(helmetConfig);
// app.use(rateLimiter);
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

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(config.app.port, config.app.host, () => {
  logger.info(`Server running on http://${config.app.host}:${config.app.port}`);
  logger.info(`Environment: ${config.app.env}`);
  logger.info(`Security: Rate limiting enabled`);
  logger.info(`Logging: ${config.logging.level} level`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", error => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

export default app;
