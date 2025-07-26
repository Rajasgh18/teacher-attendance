import { Router } from "express";

import { teacherRateLimiter } from "@/middleware/security";
import { authenticate, principalOrAdmin } from "@/middleware/auth";
import { TeacherController } from "@/controllers/teacherController";

const router: Router = Router();

// Apply rate limiting to all teacher routes
router.use(teacherRateLimiter);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, principals, admins)
router.get("/profile", TeacherController.getProfile);

// Routes accessible by principals and admins only
router.get("/", principalOrAdmin, TeacherController.getAll);
router.get(
  "/department/:department",
  principalOrAdmin,
  TeacherController.getByDepartment
);
router.get("/:id", principalOrAdmin, TeacherController.getById);
router.get(
  "/employee/:employeeId",
  principalOrAdmin,
  TeacherController.getByEmployeeId
);
router.get(
  "/:teacherId/assignments",
  principalOrAdmin,
  TeacherController.getAssignments
);

// Routes accessible by principals and admins only
router.post("/", principalOrAdmin, TeacherController.create);

router.put("/:id", principalOrAdmin, TeacherController.update);

router.delete("/:id", principalOrAdmin, TeacherController.delete);

// Teacher-subject-class assignment routes (admin and principal only)
router.post(
  "/assign",
  principalOrAdmin,
  TeacherController.assignToSubjectClass
);

router.delete(
  "/unassign",
  principalOrAdmin,
  TeacherController.removeFromSubjectClass
);

export default router;
