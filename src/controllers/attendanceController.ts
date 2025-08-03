import { Request, Response } from "express";

import { asyncHandler } from "@/middleware/errorHandler";
import { AttendanceService } from "@/services/attendanceService";
import { sendSuccess, sendCreated, sendBadRequest } from "@/utils/response";

export class AttendanceController {
  // Get all student attendance records (accessible by teachers and admins)
  static getAllStudentAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const { page, limit, studentId, classId, date } = req.query;

      const query: any = {};
      if (page) query.page = parseInt(page as string);
      if (limit) query.limit = parseInt(limit as string);
      if (studentId) query.studentId = studentId as string;
      if (classId) query.classId = classId as string;
      if (date) query.date = date as string;

      const result = await AttendanceService.getAll(query);
      sendSuccess(
        res,
        result,
        "Student attendance records retrieved successfully"
      );
    }
  );

  // Get student attendance by ID (accessible by teachers and admins)
  static getStudentAttendanceById = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        sendBadRequest(res, "Attendance ID is required");
        return;
      }

      const attendance = await AttendanceService.getStudentAttendanceById(id);
      sendSuccess(
        res,
        attendance,
        "Student attendance record retrieved successfully"
      );
    }
  );

  // Get student attendance by class (accessible by teachers assigned to the class and admins)
  static getStudentAttendanceByClass = asyncHandler(
    async (req: Request, res: Response) => {
      const { classId } = req.params;
      const { date } = req.query;

      if (!classId) {
        sendBadRequest(res, "Class ID is required");
        return;
      }

      const query: any = { classId };
      if (date) query.date = date as string;

      const attendance = await AttendanceService.getStudentAttendanceByClass(
        classId,
        query
      );
      sendSuccess(
        res,
        attendance,
        "Class attendance records retrieved successfully"
      );
    }
  );

  // Get student attendance by student (accessible by teachers assigned to the class and admins)
  static getStudentAttendanceByStudent = asyncHandler(
    async (req: Request, res: Response) => {
      const { studentId } = req.params;
      const { startDate, endDate, classId } = req.query;

      if (!studentId) {
        sendBadRequest(res, "Student ID is required");
        return;
      }

      const query: any = {};
      if (startDate) query.startDate = startDate as string;
      if (endDate) query.endDate = endDate as string;
      if (classId) query.classId = classId as string;

      const attendance = await AttendanceService.getStudentAttendanceByStudent(
        studentId,
        query
      );
      sendSuccess(
        res,
        attendance,
        "Student attendance records retrieved successfully"
      );
    }
  );

  // Get student attendance by date (accessible by teachers assigned to the class and admins)
  static getStudentAttendanceByDate = asyncHandler(
    async (req: Request, res: Response) => {
      const { date } = req.params;
      const { classId } = req.query;

      if (!date) {
        sendBadRequest(res, "Date is required");
        return;
      }

      const query: any = { date };
      if (classId) query.classId = classId as string;

      const attendance = await AttendanceService.getStudentAttendanceByDate(
        date,
        query
      );
      sendSuccess(
        res,
        attendance,
        "Date attendance records retrieved successfully"
      );
    }
  );

  // Create student attendance record (accessible by teachers assigned to the class and admins)
  static createStudentAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const attendanceData = req.body;

      if (
        !attendanceData.studentId ||
        !attendanceData.classId ||
        !attendanceData.date
      ) {
        sendBadRequest(res, "Student ID, Class ID, and Date are required");
        return;
      }

      const attendance =
        await AttendanceService.createStudentAttendance(attendanceData);
      sendCreated(
        res,
        attendance,
        "Student attendance record created successfully"
      );
    }
  );

  static createStudentAttendanceBulk = asyncHandler(
    async (req: Request, res: Response) => {
      const attendanceData = req.body;
      if (!attendanceData.length) {
        sendBadRequest(res, "Attendance data is required");
        return;
      }

      const attendance =
        await AttendanceService.createStudentAttendanceBulk(attendanceData);
      sendCreated(
        res,
        attendance,
        "Student attendance records created successfully"
      );
    }
  );

  // Update student attendance record (accessible by teachers assigned to the class and admins)
  static updateStudentAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        sendBadRequest(res, "Attendance ID is required");
        return;
      }

      const attendance = await AttendanceService.updateStudentAttendance(
        id,
        updateData
      );
      sendSuccess(
        res,
        attendance,
        "Student attendance record updated successfully"
      );
    }
  );

  // Delete student attendance record (accessible by admins only)
  static deleteStudentAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        sendBadRequest(res, "Attendance ID is required");
        return;
      }

      await AttendanceService.deleteStudentAttendance(id);
      sendSuccess(res, null, "Student attendance record deleted successfully");
    }
  );

  // Get teacher attendance
  static getAllTeacherAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const { page, limit, teacherId, classId, date } = req.query;

      const query: any = {};
      if (page) query.page = parseInt(page as string);
      if (limit) query.limit = parseInt(limit as string);
      if (teacherId) query.teacherId = teacherId as string;
      if (classId) query.classId = classId as string;
      if (date) query.date = date as string;

      const attendance = await AttendanceService.getTeacherAttendance(query);
      sendSuccess(
        res,
        attendance,
        "Teacher attendance records retrieved successfully"
      );
    }
  );

  static getTeacherAttendanceById = asyncHandler(
    async (req: Request, res: Response) => {
      const { teacherId } = req.params;

      if (!teacherId) {
        sendBadRequest(res, "Teacher ID is required");
        return;
      }

      const attendance =
        await AttendanceService.getTeacherAttendanceById(teacherId);
      sendSuccess(
        res,
        attendance,
        "Teacher attendance record retrieved successfully"
      );
    }
  );

  static createTeacherAttendance = asyncHandler(
    async (req: Request, res: Response) => {
      const attendanceData = req.body;
      const attendance =
        await AttendanceService.createTeacherAttendance(attendanceData);
      sendCreated(
        res,
        attendance,
        "Teacher attendance record created successfully"
      );
    }
  );

  static createTeacherAttendanceBulk = asyncHandler(
    async (req: Request, res: Response) => {
      const attendanceData = req.body;

      if (!attendanceData.length) {
        sendBadRequest(res, "Attendance data is required");
        return;
      }

      const attendance =
        await AttendanceService.createTeacherAttendanceBulk(attendanceData);
      sendCreated(
        res,
        attendance,
        "Teacher attendance records created successfully"
      );
    }
  );
}
