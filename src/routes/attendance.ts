import { Router } from "express";

import {
  adminOnly,
  authenticate,
  teacherOrAdmin,
  teacherAssignedToStudentClassOrAdmin,
} from "@/middleware/auth";
import { AttendanceController } from "@/controllers/attendanceController";

const router: Router = Router();

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by teachers assigned to the class and admins
router.get(
  "/student/class/:classId",
  teacherAssignedToStudentClassOrAdmin(),
  AttendanceController.getStudentAttendanceByClass
);

router.get(
  "/student/:studentId",
  teacherAssignedToStudentClassOrAdmin(),
  AttendanceController.getStudentAttendanceByStudent
);

router.get(
  "/student/date/:date",
  teacherAssignedToStudentClassOrAdmin(),
  AttendanceController.getStudentAttendanceByDate
);

// Routes accessible by all authenticated users (teachers, admins)
router.get("/", teacherOrAdmin, AttendanceController.getAllStudentAttendance);
router.get(
  "/:id",
  AttendanceController.getStudentAttendanceById
);

// Routes accessible by teachers assigned to the class and admins
router.post(
  "/student",
  teacherAssignedToStudentClassOrAdmin(),
  AttendanceController.createStudentAttendance
);
router.post(
  "/student/bulk",
  teacherOrAdmin,
  AttendanceController.createStudentAttendanceBulk
);

router.put(
  "/student/:id",
  teacherAssignedToStudentClassOrAdmin(),
  AttendanceController.updateStudentAttendance
);

router.get(
  "/teacher",
  AttendanceController.getAllTeacherAttendance
);

router.get(
  "/teacher/:teacherId",
  AttendanceController.getTeacherAttendanceById
);

router.post(
  "/teacher",
  AttendanceController.createTeacherAttendance
);

router.post(
  "/teacher/bulk",
  AttendanceController.createTeacherAttendanceBulk
);

// Routes accessible by admins only
router.delete(
  "/student/:id",
  adminOnly,
  AttendanceController.deleteStudentAttendance
);

export default router;
