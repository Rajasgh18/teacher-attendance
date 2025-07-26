import { Router } from "express";

import { classRateLimiter } from "@/middleware/security";
import { ClassController } from "@/controllers/classController";
import { authenticate, principalOrAdmin } from "@/middleware/auth";

const router: Router = Router();

// Apply rate limiting to all class routes
router.use(classRateLimiter);

// Public routes (no authentication required)
router.get("/active", ClassController.getActive);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, principals, admins)
// (No specific routes for all users in class management)

// Routes accessible by principals and admins only
router.get("/", principalOrAdmin, ClassController.getAll);
router.get("/grade/:grade", principalOrAdmin, ClassController.getByGrade);
router.get(
  "/academic-year/:academicYear",
  principalOrAdmin,
  ClassController.getByAcademicYear
);
router.get("/:id", principalOrAdmin, ClassController.getById);
router.get(
  "/name/:name/grade/:grade",
  principalOrAdmin,
  ClassController.getByNameAndGrade
);
router.get("/:classId/students", principalOrAdmin, ClassController.getStudents);
router.get(
  "/:classId/teachers",
  principalOrAdmin,
  ClassController.getWithTeachers
);
router.get("/:classId/stats", principalOrAdmin, ClassController.getClassStats);

// Routes accessible by principals and admins only
router.post("/", principalOrAdmin, ClassController.create);

router.put("/:id", principalOrAdmin, ClassController.update);

router.delete("/:id", principalOrAdmin, ClassController.delete);

export default router;
