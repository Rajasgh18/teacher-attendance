import { Router } from "express";

import {
  authenticate,
  adminOnly,
  teacherOrAdmin,
  teacherAssignedToClassOrAdmin,
} from "@/middleware/auth";
import { classRateLimiter } from "@/middleware/security";
import { ClassController } from "@/controllers/classController";

const router: Router = Router();

// Apply rate limiting to all class routes
// router.use(classRateLimiter);

// Public routes (no authentication required)
router.get("/active", ClassController.getActive);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, admins)
router.get("/", teacherOrAdmin, ClassController.getAll);
router.get("/grade/:grade", teacherOrAdmin, ClassController.getByGrade);
router.get(
  "/academic-year/:academicYear",
  teacherOrAdmin,
  ClassController.getByAcademicYear
);

// Routes accessible by teachers assigned to the class and admins
router.get("/:id", teacherAssignedToClassOrAdmin(), ClassController.getById);
router.get(
  "/name/:name/grade/:grade",
  teacherOrAdmin,
  ClassController.getByNameAndGrade
);
router.get(
  "/:classId/students",
  teacherAssignedToClassOrAdmin(),
  ClassController.getStudents
);
router.get(
  "/:classId/teachers",
  teacherAssignedToClassOrAdmin(),
  ClassController.getWithTeachers
);
router.get(
  "/:classId/stats",
  teacherAssignedToClassOrAdmin(),
  ClassController.getClassStats
);

// Routes accessible by admins only
router.post("/", adminOnly, ClassController.create);
router.put("/:id", adminOnly, ClassController.update);
router.delete("/:id", adminOnly, ClassController.delete);

export default router;
