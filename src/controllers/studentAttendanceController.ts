import { Request, Response } from "express";

import { asyncHandler } from "@/middleware/errorHandler";
import { sendSuccess, sendCreated, sendBadRequest } from "@/utils/response";
import { StudentAttendanceService } from "@/services/studentAttendanceService";

export class StudentAttendanceController {
  // Get all student attendance records (accessible by principals and admins)
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, studentId, classId, date } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (studentId) query.studentId = studentId as string;
    if (classId) query.classId = classId as string;
    if (date) query.date = date as string;

    const result = await StudentAttendanceService.getAll(query);
    sendSuccess(
      res,
      result,
      "Student attendance records retrieved successfully"
    );
  });

  // Get student attendance by ID (accessible by principals and admins)
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Attendance ID is required");
      return;
    }

    const attendance = await StudentAttendanceService.getById(id);
    sendSuccess(
      res,
      attendance,
      "Student attendance record retrieved successfully"
    );
  });

  // Get student attendance by class (accessible by teachers assigned to the class, principals, and admins)
  static getByClass = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;
    const { date } = req.query;

    if (!classId) {
      sendBadRequest(res, "Class ID is required");
      return;
    }

    const query: any = { classId };
    if (date) query.date = date as string;

    const attendance = await StudentAttendanceService.getByClass(
      classId,
      query
    );
    sendSuccess(
      res,
      attendance,
      "Class attendance records retrieved successfully"
    );
  });

  // Get student attendance by student (accessible by teachers assigned to the class, principals, and admins)
  static getByStudent = asyncHandler(async (req: Request, res: Response) => {
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

    const attendance = await StudentAttendanceService.getByStudent(
      studentId,
      query
    );
    sendSuccess(
      res,
      attendance,
      "Student attendance records retrieved successfully"
    );
  });

  // Get student attendance by date (accessible by teachers assigned to the class, principals, and admins)
  static getByDate = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.params;
    const { classId } = req.query;

    if (!date) {
      sendBadRequest(res, "Date is required");
      return;
    }

    const query: any = { date };
    if (classId) query.classId = classId as string;

    const attendance = await StudentAttendanceService.getByDate(date, query);
    sendSuccess(
      res,
      attendance,
      "Date attendance records retrieved successfully"
    );
  });

  // Create student attendance record (accessible by principals and admins)
  static create = asyncHandler(async (req: Request, res: Response) => {
    const attendanceData = req.body;

    if (
      !attendanceData.studentId ||
      !attendanceData.classId ||
      !attendanceData.date
    ) {
      sendBadRequest(res, "Student ID, Class ID, and Date are required");
      return;
    }

    const attendance = await StudentAttendanceService.create(attendanceData);
    sendCreated(
      res,
      attendance,
      "Student attendance record created successfully"
    );
  });

  // Update student attendance record (accessible by principals and admins)
  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      sendBadRequest(res, "Attendance ID is required");
      return;
    }

    const attendance = await StudentAttendanceService.update(id, updateData);
    sendSuccess(
      res,
      attendance,
      "Student attendance record updated successfully"
    );
  });

  // Delete student attendance record (accessible by principals and admins)
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Attendance ID is required");
      return;
    }

    await StudentAttendanceService.delete(id);
    sendSuccess(res, null, "Student attendance record deleted successfully");
  });
}
