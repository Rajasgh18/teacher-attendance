import logger from "@/utils/logger";
import { config } from "@/config";

import app from "./app";

const server = app.listen(config.app.port, config.app.host, () => {
  logger.info(`Server running on http://${config.app.host}:${config.app.port}`);
  logger.info(`Environment: ${config.app.env}`);
  logger.info(`Security: Rate limiting enabled`);
  logger.info(`Logging: ${config.logging.level} level`);
});

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
