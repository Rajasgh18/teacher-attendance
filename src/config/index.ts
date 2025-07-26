import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Environment variables schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000").transform(Number),
  HOST: z.string().default("localhost"),

  // Database (for Drizzle)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  JWT_RESET_SECRET: z
    .string()
    .min(32, "JWT_RESET_SECRET must be at least 32 characters"),

  // Security
  BCRYPT_ROUNDS: z.string().default("12").transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100").transform(Number),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE_PATH: z.string().default("logs/app.log"),

  // CORS
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000,http://localhost:3001"),

  // File Upload
  MAX_FILE_SIZE: z.string().default("5242880").transform(Number),
  UPLOAD_PATH: z.string().default("uploads"),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Redis
  REDIS_URL: z.string().optional(),
});

// Parse and validate environment variables
const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error(
    "❌ Invalid environment variables:",
    envParse.error.flatten().fieldErrors
  );
  process.exit(1);
}

const env = envParse.data;

// Configuration object
export const config = {
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  },

  database: {
    url: env.DATABASE_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    resetSecret: env.JWT_RESET_SECRET,
  },

  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },

  logging: {
    level: env.LOG_LEVEL,
    filePath: env.LOG_FILE_PATH,
  },

  cors: {
    origin: env.CORS_ORIGIN.split(",").map((origin: string) => origin.trim()),
  },

  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    path: env.UPLOAD_PATH,
  },

  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  redis: {
    url: env.REDIS_URL,
  },
} as const;

export type Config = typeof config;
