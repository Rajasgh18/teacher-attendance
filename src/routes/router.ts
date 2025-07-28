import { Router } from "express";

import authRoutes from "./auth";
import userRoutes from "./user";
import classRoutes from "./class";
import studentRoutes from "./student";
import subjectRoutes from "./subject";
import teacherRoutes from "./teacher";
import studentAttendanceRoutes from "./student-attendance";

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
appRouter.use("/teacher", teacherRoutes);
appRouter.use("/subject", subjectRoutes);
appRouter.use("/student", studentRoutes);
appRouter.use("/student-attendance", studentAttendanceRoutes);

export default appRouter;
