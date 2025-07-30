import { Router } from "express";

import {
  authenticate,
  adminOnly,
  teacherOrAdmin,
  teacherAssignedToStudentClassOrAdmin,
} from "@/middleware/auth";
import { StudentAttendanceController } from "@/controllers/studentAttendanceController";

const router: Router = Router();

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by teachers assigned to the class and admins
router.get(
  "/class/:classId",
  teacherAssignedToStudentClassOrAdmin(),
  StudentAttendanceController.getByClass
);

router.get(
  "/student/:studentId",
  teacherAssignedToStudentClassOrAdmin(),
  StudentAttendanceController.getByStudent
);

router.get(
  "/date/:date",
  teacherAssignedToStudentClassOrAdmin(),
  StudentAttendanceController.getByDate
);

// Routes accessible by all authenticated users (teachers, admins)
router.get("/", teacherOrAdmin, StudentAttendanceController.getAll);
router.get("/:id", teacherOrAdmin, StudentAttendanceController.getById);

// Routes accessible by teachers assigned to the class and admins
router.post("/", teacherAssignedToStudentClassOrAdmin(), StudentAttendanceController.create);
router.put("/:id", teacherAssignedToStudentClassOrAdmin(), StudentAttendanceController.update);

// Routes accessible by admins only
router.delete("/:id", adminOnly, StudentAttendanceController.delete);

export default router;
