import { Router } from "express";

import {
  adminOrPrincipal,
  authenticate,
  teacherOrAdmin,
  teacherFromSameSchoolAsStudentOrAdmin,
} from "@/middleware/auth";
import { AttendanceController } from "@/controllers/attendanceController";

const router: Router = Router();

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by teachers assigned to the class and admins
router.get(
  "/student/class/:classId",
  AttendanceController.getStudentAttendanceByClass
);

router.get(
  "/student/:studentId",
  AttendanceController.getStudentAttendanceByStudent
);

router.get(
  "/student/date/:date",
  AttendanceController.getStudentAttendanceByDate
);

// Routes accessible by all authenticated users (teachers, admins)
router.get(
  "/student",
  teacherOrAdmin,
  AttendanceController.getAllStudentAttendance
);

// Routes accessible by teachers assigned to the class and admins
router.post("/student", AttendanceController.createStudentAttendance);
router.post(
  "/student/bulk",
  teacherOrAdmin,
  AttendanceController.createStudentAttendanceBulk
);

router.put("/student/:id", AttendanceController.updateStudentAttendance);

router.get("/teacher", AttendanceController.getAllTeacherAttendance);

router.get(
  "/teacher/:teacherId",
  AttendanceController.getTeacherAttendanceById
);

router.get("/:id", AttendanceController.getAttendanceById);

router.post("/teacher", AttendanceController.createTeacherAttendance);

router.post("/teacher/bulk", AttendanceController.createTeacherAttendanceBulk);

// Routes accessible by admins only
router.delete(
  "/student/:id",
  adminOrPrincipal,
  AttendanceController.deleteStudentAttendance
);

export default router;
