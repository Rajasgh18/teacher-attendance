import { Request, Response } from "express";

import { asyncHandler } from "@/middleware/errorHandler";
import { StudentService } from "@/services/studentService";
import { sendSuccess, sendCreated, sendBadRequest } from "@/utils/response";

export class StudentController {
  // Get all students (accessible by teachers and admins)
  static getAll = async (req: Request, res: Response) => {
    const { page, limit, search, classId, schoolId } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (classId) query.classId = classId as string;
    if (schoolId) query.schoolId = schoolId as string;

    const result = await StudentService.getAll(query);
    sendSuccess(res, result, "Students retrieved successfully");
  };

  // Get student by ID (accessible by teachers and admins)
  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Student ID is required");
      return;
    }

    const student = await StudentService.getById(id);
    sendSuccess(res, student, "Student retrieved successfully");
  };

  // Create new student (admin only)
  static create = async (req: Request, res: Response) => {
    const {
      studentId,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      classId,
      schoolId,
      isActive = true,
    } = req.body;

    if (
      !studentId ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !dateOfBirth ||
      !gender ||
      !classId ||
      !schoolId
    ) {
      sendBadRequest(res, "All required fields must be provided");
      return;
    }

    if (studentId.length > 50) {
      sendBadRequest(res, "Student ID must be 50 characters or less");
      return;
    }

    if (firstName.length > 100) {
      sendBadRequest(res, "First name must be 100 characters or less");
      return;
    }

    if (lastName.length > 100) {
      sendBadRequest(res, "Last name must be 100 characters or less");
      return;
    }

    if (email.length > 255) {
      sendBadRequest(res, "Email must be 255 characters or less");
      return;
    }

    if (phone.length > 20) {
      sendBadRequest(res, "Phone must be 20 characters or less");
      return;
    }

    if (!["male", "female", "other"].includes(gender)) {
      sendBadRequest(res, "Gender must be male, female, or other");
      return;
    }

    if (!schoolId) {
      sendBadRequest(res, "School ID is required");
      return;
    }

    const student = await StudentService.create({
      studentId,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      schoolId,
      classId,
      isActive,
    });

    sendCreated(res, student, "Student created successfully");
  };

  // Update student (admin only)
  static update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      studentId,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      classId,
      isActive,
    } = req.body;

    if (!id) {
      sendBadRequest(res, "Student ID is required");
      return;
    }

    const updateData: any = {};
    if (studentId !== undefined) {
      if (studentId.length > 50) {
        sendBadRequest(res, "Student ID must be 50 characters or less");
        return;
      }
      updateData.studentId = studentId;
    }

    if (firstName !== undefined) {
      if (firstName.length > 100) {
        sendBadRequest(res, "First name must be 100 characters or less");
        return;
      }
      updateData.firstName = firstName;
    }

    if (lastName !== undefined) {
      if (lastName.length > 100) {
        sendBadRequest(res, "Last name must be 100 characters or less");
        return;
      }
      updateData.lastName = lastName;
    }

    if (email !== undefined) {
      if (email.length > 255) {
        sendBadRequest(res, "Email must be 255 characters or less");
        return;
      }
      updateData.email = email;
    }

    if (phone !== undefined) {
      if (phone.length > 20) {
        sendBadRequest(res, "Phone must be 20 characters or less");
        return;
      }
      updateData.phone = phone;
    }

    if (address !== undefined) {
      updateData.address = address;
    }

    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth;
    }

    if (gender !== undefined) {
      if (!["male", "female", "other"].includes(gender)) {
        sendBadRequest(res, "Gender must be male, female, or other");
        return;
      }
      updateData.gender = gender;
    }

    if (classId !== undefined) {
      updateData.classId = classId;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const student = await StudentService.update(id, updateData);
    sendSuccess(res, student, "Student updated successfully");
  };

  // Delete student (soft delete - admin only)
  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Student ID is required");
      return;
    }

    await StudentService.delete(id);
    sendSuccess(res, null, "Student deleted successfully");
  };

  // Get student's attendance records (accessible by teachers and admins)
  static getAttendance = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate, classId } = req.query;

    if (!id) {
      sendBadRequest(res, "Student ID is required");
      return;
    }

    const query: any = {};
    if (startDate) query.startDate = startDate as string;
    if (endDate) query.endDate = endDate as string;
    if (classId) query.classId = classId as string;

    const attendance = await StudentService.getAttendance(id, query);
    sendSuccess(res, attendance, "Student attendance retrieved successfully");
  };
}
