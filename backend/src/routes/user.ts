import { Router } from "express";

import {
  adminOnly,
  selfOrAdmin,
  authenticate,
  adminOrPrincipal,
} from "@/middleware/auth";
import { userRateLimiter } from "@/middleware/security";
import { UserController } from "@/controllers/userController";

const router: Router = Router();

// Apply rate limiting to all user routes
// router.use(userRateLimiter);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, admins)
router.get("/profile", UserController.getProfile);
router.get("/classes", UserController.getClasses);
router.post("/check-in", UserController.checkIn);

// Teacher-specific routes (admin only)
router.get("/teachers", adminOnly, UserController.getAllTeachers);
router.get(
  "/teachers/department/:department",
  adminOnly,
  UserController.getTeachersByDepartment
);
router.get(
  "/teachers/employee/:employeeId",
  adminOnly,
  UserController.getByEmployeeId
);

// Teacher assignments (admin or self)
router.get("/assignments", UserController.getTeacherAssignments);

router.get(
  "/teachers/:teacherId/subjects",
  selfOrAdmin("teacherId"),
  UserController.getTeacherSubjects
);
router.put("/:id/change-password", selfOrAdmin, UserController.changePassword);
router.post("/live-location", UserController.createLiveLocation);

// Routes accessible by admins only
router.get("/", adminOrPrincipal, UserController.getAll);
router.get("/all", adminOrPrincipal, UserController.getAllUsers);
router.get("/stats", adminOrPrincipal, UserController.getUserStats);
router.get("/search", adminOrPrincipal, UserController.searchUsers);
router.get("/role/:role", adminOrPrincipal, UserController.getByRole);
router.get("/email/:email", adminOrPrincipal, UserController.getByEmail);
router.get("/:id", adminOrPrincipal, UserController.getById);

// Routes accessible by admins only
router.post("/", adminOrPrincipal, UserController.create);

router.put("/:id", selfOrAdmin, UserController.update);
router.put("/:id/password", selfOrAdmin, UserController.updatePassword);

router.delete("/:id", adminOrPrincipal, UserController.delete);

export default router;
