import { Router } from "express";

import {
  authenticate,
  teacherOrAdmin,
  teacherFromSameSchoolAsStudentOrAdmin,
  adminOrPrincipal,
} from "@/middleware/auth";
import { StudentController } from "@/controllers/studentController";

const router: Router = Router();

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, admins)
router.get("/", StudentController.getAll);

// Routes accessible by teachers from same school and admins
router.get(
  "/:id",
  teacherFromSameSchoolAsStudentOrAdmin(),
  StudentController.getById
);

router.get(
  "/:id/attendance",
  teacherFromSameSchoolAsStudentOrAdmin(),
  StudentController.getAttendance
);

// Routes accessible by admins only
router.post("/", adminOrPrincipal, StudentController.create);
router.put("/:id", adminOrPrincipal, StudentController.update);
router.delete("/:id", adminOrPrincipal, StudentController.delete);

export default router;
