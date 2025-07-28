import { Router } from "express";

import {
  authenticate,
  principalOrAdmin,
  teacherAssignedToStudentClassOrAdmin,
} from "@/middleware/auth";
import { StudentAttendanceController } from "@/controllers/studentAttendanceController";

const router: Router = Router();

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by teachers assigned to the class, principals, and admins
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

// Routes accessible by principals and admins only
router.get("/", principalOrAdmin, StudentAttendanceController.getAll);

router.get("/:id", principalOrAdmin, StudentAttendanceController.getById);

router.post("/", principalOrAdmin, StudentAttendanceController.create);

router.put("/:id", principalOrAdmin, StudentAttendanceController.update);

router.delete("/:id", principalOrAdmin, StudentAttendanceController.delete);

export default router;
