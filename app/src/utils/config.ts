import { API_URL, DATABASE_URL, JWT_SECRET } from "@env";

export const config = {
  api: {
    baseUrl: API_URL || "http://localhost:3000/api/v1",
    timeout: 10000,
    retries: 3,
  },
  database: {
    url: DATABASE_URL || "sqlite://./app.db",
  },
  auth: {
    jwtSecret: JWT_SECRET || "your-default-secret",
    tokenExpiry: "7d",
  },
  app: {
    name: "Teacher Attendance",
    version: "1.0.0",
    environment: __DEV__ ? "development" : "production",
  },
} as const;

// Type-safe config access
export type Config = typeof config;
