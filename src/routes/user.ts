import { Router } from "express";

import { adminOnly, selfOrAdmin, authenticate } from "@/middleware/auth";
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
router.get(
  "/teachers/:teacherId/assignments",
  selfOrAdmin("teacherId"),
  UserController.getTeacherAssignments
);

// Teacher-class assignment routes (admin only)
router.post("/teachers/assign", adminOnly, UserController.assignTeacherToClass);
router.post(
  "/teachers/remove",
  adminOnly,
  UserController.removeTeacherFromClass
);

// Routes accessible by admins only
router.get("/", adminOnly, UserController.getAll);
router.get("/all", adminOnly, UserController.getAllUsers);
router.get("/stats", adminOnly, UserController.getUserStats);
router.get("/search", adminOnly, UserController.searchUsers);
router.get("/role/:role", adminOnly, UserController.getByRole);
router.get("/email/:email", adminOnly, UserController.getByEmail);
router.get("/:id", selfOrAdmin, UserController.getById);

// Routes accessible by admins only
router.post("/", adminOnly, UserController.create);

router.put("/:id", selfOrAdmin, UserController.update);
router.put("/:id/password", selfOrAdmin, UserController.updatePassword);
router.put("/:id/change-password", selfOrAdmin, UserController.changePassword);

router.delete("/:id", adminOnly, UserController.delete);

export default router;
