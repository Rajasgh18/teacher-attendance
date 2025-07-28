import { Request, Response } from "express";

import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendUnauthorized,
} from "@/utils/response";
import { asyncHandler } from "@/middleware/errorHandler";
import { TeacherService } from "@/services/teacherService";

export class TeacherController {
  // Get all teachers (accessible by principals and admins)
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, department, isActive } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (department) query.department = department as string;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const result = await TeacherService.getAll(query);
    sendSuccess(res, result, "Teachers retrieved successfully");
  });

  // Get teacher by ID (accessible by principals and admins, or self)
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Teacher ID is required");
      return;
    }

    const teacher = await TeacherService.getById(id);
    sendSuccess(res, teacher, "Teacher retrieved successfully");
  });

  // Get teacher by employee ID (accessible by principals and admins, or self)
  static getByEmployeeId = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;

    if (!employeeId) {
      sendBadRequest(res, "Employee ID is required");
      return;
    }

    const teacher = await TeacherService.getByEmployeeId(employeeId);
    sendSuccess(res, teacher, "Teacher retrieved successfully");
  });

  // Create new teacher (admin and principal only)
  static create = asyncHandler(async (req: Request, res: Response) => {
    const {
      userId,
      employeeId,
      department,
      phone,
      address,
      hireDate,
      isActive = true,
    } = req.body;

    if (
      !userId ||
      !employeeId ||
      !department ||
      !phone ||
      !address ||
      !hireDate
    ) {
      sendBadRequest(res, "All required fields must be provided");
      return;
    }

    if (employeeId.length > 50) {
      sendBadRequest(res, "Employee ID must be 50 characters or less");
      return;
    }

    if (department.length > 100) {
      sendBadRequest(res, "Department must be 100 characters or less");
      return;
    }

    if (phone.length > 20) {
      sendBadRequest(res, "Phone must be 20 characters or less");
      return;
    }

    const teacher = await TeacherService.create({
      userId,
      employeeId,
      department,
      phone,
      address,
      hireDate,
      isActive,
    });

    sendCreated(res, teacher, "Teacher created successfully");
  });

  // Update teacher (admin and principal only, or self)
  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { employeeId, department, phone, address, hireDate, isActive } =
      req.body;

    if (!id) {
      sendBadRequest(res, "Teacher ID is required");
      return;
    }

    const updateData: any = {};
    if (employeeId !== undefined) {
      if (employeeId.length > 50) {
        sendBadRequest(res, "Employee ID must be 50 characters or less");
        return;
      }
      updateData.employeeId = employeeId;
    }

    if (department !== undefined) {
      if (department.length > 100) {
        sendBadRequest(res, "Department must be 100 characters or less");
        return;
      }
      updateData.department = department;
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

    if (hireDate !== undefined) {
      updateData.hireDate = hireDate;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const teacher = await TeacherService.update(id, updateData);
    sendSuccess(res, teacher, "Teacher updated successfully");
  });

  // Delete teacher (soft delete - admin and principal only)
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Teacher ID is required");
      return;
    }

    await TeacherService.delete(id);
    sendSuccess(res, null, "Teacher deleted successfully");
  });

  // Get teacher's assignments (accessible by principals and admins, or self)
  static getAssignments = asyncHandler(async (req: Request, res: Response) => {
    const { teacherId } = req.params;

    if (!teacherId) {
      sendBadRequest(res, "Teacher ID is required");
      return;
    }

    // For admin and principal, they can access any teacher's assignments
    if (req.user?.role === "admin" || req.user?.role === "principal") {
      const assignments = await TeacherService.getAssignments(teacherId);
      sendSuccess(
        res,
        assignments,
        "Teacher assignments retrieved successfully"
      );
      return;
    }

    // For teachers, they can only access their own assignments
    if (req.user?.role === "teacher") {
      const teacher = await TeacherService.getByUserId(req.user.userId);

      if (teacher.id.toString() !== teacherId.toString()) {
        sendUnauthorized(res, "You are not authorized to access this resource");
        return;
      }

      const assignments = await TeacherService.getAssignments(teacherId);
      sendSuccess(
        res,
        assignments,
        "Teacher assignments retrieved successfully"
      );
      return;
    }

    sendUnauthorized(res, "You are not authorized to access this resource");
  });

  // Assign teacher to class (admin and principal only)
  static assignToClass = asyncHandler(
    async (req: Request, res: Response) => {
      const {
        teacherId,
        classId,
        isPrimaryTeacher = false,
      } = req.body;

      if (!teacherId || !classId) {
        sendBadRequest(
          res,
          "Teacher ID and Class ID are required"
        );
        return;
      }

      const assignment = await TeacherService.assignToClass(
        teacherId,
        classId,
        isPrimaryTeacher
      );

      sendCreated(
        res,
        assignment,
        "Teacher assigned to class successfully"
      );
    }
  );

  // Remove teacher from class assignment (admin and principal only)
  static removeFromClass = asyncHandler(
    async (req: Request, res: Response) => {
      const { teacherId, classId } = req.body;

      if (!teacherId || !classId) {
        sendBadRequest(
          res,
          "Teacher ID and Class ID are required"
        );
        return;
      }

      await TeacherService.removeFromClass(
        teacherId,
        classId
      );
      sendSuccess(
        res,
        null,
        "Teacher removed from class assignment successfully"
      );
    }
  );

  // Get teachers by department (accessible by principals and admins)
  static getByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { department } = req.params;

    if (!department) {
      sendBadRequest(res, "Department parameter is required");
      return;
    }

    const teachers = await TeacherService.getByDepartment(department);
    sendSuccess(res, teachers, "Teachers retrieved successfully");
  });

  // Get current teacher's profile (self access)
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      sendBadRequest(res, "User not authenticated");
      return;
    }

    // Find teacher by userId
    const teacher = await TeacherService.getByUserId(userId);
    sendSuccess(res, teacher, "Teacher profile retrieved successfully");
  });
}
