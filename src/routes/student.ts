import { Router } from "express";

import {
  authenticate,
  adminOnly,
  teacherOrAdmin,
  teacherFromSameSchoolAsStudentOrAdmin,
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

// Routes accessible by all authenticated users (teachers, admins)
router.get("/", teacherOrAdmin, StudentController.getAll);
router.get("/gender/:gender", teacherOrAdmin, StudentController.getByGender);

// Routes accessible by teachers from same school and admins
router.get(
  "/class/:classId",
  teacherFromSameSchoolAsStudentOrAdmin(),
  StudentController.getByClass
);
router.get(
  "/:id",
  teacherFromSameSchoolAsStudentOrAdmin(),
  StudentController.getById
);
router.get(
  "/student/:studentId",
  teacherFromSameSchoolAsStudentOrAdmin(),
  StudentController.getByStudentId
);
router.get(
  "/:studentId/attendance",
  teacherFromSameSchoolAsStudentOrAdmin(),
  StudentController.getAttendance
);

// Routes accessible by admins only
router.post("/", adminOnly, StudentController.create);
router.put("/:id", adminOnly, StudentController.update);
router.delete("/:id", adminOnly, StudentController.delete);

export default router;
