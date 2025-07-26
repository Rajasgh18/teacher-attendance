import { Router } from "express";

import { studentRateLimiter } from "@/middleware/security";
import { authenticate, principalOrAdmin } from "@/middleware/auth";
import { StudentController } from "@/controllers/studentController";

const router: Router = Router();

// Apply rate limiting to all student routes
router.use(studentRateLimiter);

// Public routes (no authentication required)
router.get("/active", StudentController.getActive);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, principals, admins)
// (No specific routes for all users in student management)

// Routes accessible by principals and admins only
router.get("/", principalOrAdmin, StudentController.getAll);
router.get("/class/:classId", principalOrAdmin, StudentController.getByClass);
router.get("/gender/:gender", principalOrAdmin, StudentController.getByGender);
router.get("/:id", principalOrAdmin, StudentController.getById);
router.get(
  "/student/:studentId",
  principalOrAdmin,
  StudentController.getByStudentId
);
router.get(
  "/:studentId/attendance",
  principalOrAdmin,
  StudentController.getAttendance
);

// Routes accessible by principals and admins only
router.post("/", principalOrAdmin, StudentController.create);

router.put("/:id", principalOrAdmin, StudentController.update);

router.delete("/:id", principalOrAdmin, StudentController.delete);

export default router;
