import path from "path";
import winston from "winston";

import { config } from "@/config";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  return config.logging.level;
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) =>
      `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format,
  }),

  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "error.log"),
    level: "error",
    format: fileFormat,
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "combined.log"),
    format: fileFormat,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from "fs";
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;
