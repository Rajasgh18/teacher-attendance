import { Router } from "express";

import {
  authenticate,
  principalOrAdmin,
  teacherAssignedToStudentClassOrAdmin,
} from "@/middleware/auth";
import { studentRateLimiter } from "@/middleware/security";
import { StudentController } from "@/controllers/studentController";

const router: Router = Router();

// Apply rate limiting to all student routes
// router.use(studentRateLimiter);

// Public routes (no authentication required)
router.get("/active", StudentController.getActive);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, principals, admins)
// (No specific routes for all users in student management)

// Routes accessible by principals and admins only
router.get("/", principalOrAdmin, StudentController.getAll);
router.get("/gender/:gender", principalOrAdmin, StudentController.getByGender);

// Routes accessible by teachers assigned to the class, principals, and admins
router.get(
  "/class/:classId",
  teacherAssignedToStudentClassOrAdmin(),
  StudentController.getByClass
);
router.get(
  "/:id",
  teacherAssignedToStudentClassOrAdmin(),
  StudentController.getById
);
router.get(
  "/student/:studentId",
  teacherAssignedToStudentClassOrAdmin(),
  StudentController.getByStudentId
);
router.get(
  "/:studentId/attendance",
  teacherAssignedToStudentClassOrAdmin(),
  StudentController.getAttendance
);

// Routes accessible by principals and admins only
router.post("/", principalOrAdmin, StudentController.create);

router.put("/:id", principalOrAdmin, StudentController.update);

router.delete("/:id", principalOrAdmin, StudentController.delete);

export default router;
