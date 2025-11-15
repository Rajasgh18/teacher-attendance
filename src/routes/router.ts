import { Router } from "express";

import authRoutes from "./auth";
import userRoutes from "./user";
import classRoutes from "./class";
import studentRoutes from "./student";
import attendanceRoutes from "./attendance";
import subjectRoutes from "./subject";
import schoolRoutes from "./schools";

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
appRouter.use("/user", userRoutes);
appRouter.use("/class", classRoutes);
appRouter.use("/student", studentRoutes);
appRouter.use("/attendance", attendanceRoutes);
appRouter.use("/subject", subjectRoutes);
appRouter.use("/schools", schoolRoutes);

export default appRouter;
