import { Router } from "express";

import authRoutes from "./auth";

const appRouter: Router = Router();

appRouter.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

appRouter.use("/auth", authRoutes);

export default appRouter;
