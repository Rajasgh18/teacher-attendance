import { Request, Response } from "express";

import { UserService } from "@/services/userService";
import { asyncHandler } from "@/middleware/errorHandler";
import { sendSuccess, sendCreated, sendBadRequest } from "@/utils/response";
import { StudentService } from "@/services/studentService";

export class UserController {
  // Get all users (admin only)
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, role, department, isActive } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (role) query.role = role as string;
    if (department) query.department = department as string;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const result = await UserService.getAll(query);
    sendSuccess(res, result, "Users retrieved successfully");
  });

  // Get all classes of a user
  static getClasses = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      sendBadRequest(res, "User ID is required");
      return;
    }

    const classes = await UserService.getClasses(req.user.userId);
    sendSuccess(res, classes, "Classes retrieved successfully");
  });

  // Get all teachers (admin only)
  static getAllTeachers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, department, isActive } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (department) query.department = department as string;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const result = await UserService.getAllTeachers(query);
    sendSuccess(res, result, "Teachers retrieved successfully");
  });

  // Get user by ID (admin only, or self)
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "User ID is required");
      return;
    }

    const user = await UserService.getById(id);
    sendSuccess(res, user, "User retrieved successfully");
  });

  // Get teacher by employee ID (admin only)
  static getByEmployeeId = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;

    if (!employeeId) {
      sendBadRequest(res, "Employee ID is required");
      return;
    }

    const teacher = await UserService.getByEmployeeId(employeeId);
    sendSuccess(res, teacher, "Teacher retrieved successfully");
  });

  // Get user by email (admin only)
  static getByEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;

    if (!email) {
      sendBadRequest(res, "Email is required");
      return;
    }

    const user = await UserService.getByEmail(email);
    sendSuccess(res, user, "User retrieved successfully");
  });

  // Create new user (admin only)
  static create = asyncHandler(async (req: Request, res: Response) => {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      employeeId,
      department,
      phone,
      address,
      hireDate,
      isActive = true,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      sendBadRequest(res, "All required fields must be provided");
      return;
    }

    if (email.length > 255) {
      sendBadRequest(res, "Email must be 255 characters or less");
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

    if (!["admin", "teacher"].includes(role)) {
      sendBadRequest(res, "Role must be admin or teacher");
      return;
    }

    if (password.length < 8) {
      sendBadRequest(res, "Password must be at least 8 characters long");
      return;
    }

    // Validate teacher-specific fields if role is teacher
    if (role === "teacher") {
      if (!employeeId || !department || !phone || !address || !hireDate) {
        sendBadRequest(
          res,
          "All teacher fields must be provided for teacher role"
        );
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
    }

    const user = await UserService.create({
      email,
      password,
      firstName,
      lastName,
      role,
      employeeId,
      department,
      phone,
      address,
      hireDate,
      isActive,
    });

    sendCreated(res, user, "User created successfully");
  });

  // Update user (admin only, or self)
  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      role,
      employeeId,
      department,
      phone,
      address,
      hireDate,
      isActive,
    } = req.body;

    if (!id) {
      sendBadRequest(res, "User ID is required");
      return;
    }

    if (email && email.length > 255) {
      sendBadRequest(res, "Email must be 255 characters or less");
      return;
    }

    if (firstName && firstName.length > 100) {
      sendBadRequest(res, "First name must be 100 characters or less");
      return;
    }

    if (lastName && lastName.length > 100) {
      sendBadRequest(res, "Last name must be 100 characters or less");
      return;
    }

    if (role && !["admin", "teacher"].includes(role)) {
      sendBadRequest(res, "Role must be admin or teacher");
      return;
    }

    // Validate teacher-specific fields if role is teacher
    if (role === "teacher") {
      if (employeeId && employeeId.length > 50) {
        sendBadRequest(res, "Employee ID must be 50 characters or less");
        return;
      }

      if (department && department.length > 100) {
        sendBadRequest(res, "Department must be 100 characters or less");
        return;
      }

      if (phone && phone.length > 20) {
        sendBadRequest(res, "Phone must be 20 characters or less");
        return;
      }
    }

    const user = await UserService.update(id, {
      email,
      firstName,
      lastName,
      role,
      employeeId,
      department,
      phone,
      address,
      hireDate,
      isActive,
    });

    sendSuccess(res, user, "User updated successfully");
  });

  // Update user password (admin only, or self)
  static updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!id) {
      sendBadRequest(res, "User ID is required");
      return;
    }

    if (!newPassword) {
      sendBadRequest(res, "New password is required");
      return;
    }

    if (newPassword.length < 8) {
      sendBadRequest(res, "Password must be at least 8 characters long");
      return;
    }

    await UserService.updatePassword(id, newPassword);
    sendSuccess(res, null, "Password updated successfully");
  });

  // Change user password (requires current password)
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!id) {
      sendBadRequest(res, "User ID is required");
      return;
    }

    if (!currentPassword || !newPassword) {
      sendBadRequest(res, "Current password and new password are required");
      return;
    }

    if (newPassword.length < 8) {
      sendBadRequest(res, "New password must be at least 8 characters long");
      return;
    }

    await UserService.changePassword(id, currentPassword, newPassword);
    sendSuccess(res, null, "Password changed successfully");
  });

  // Delete user (admin only)
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "User ID is required");
      return;
    }

    await UserService.delete(id);
    sendSuccess(res, null, "User deleted successfully");
  });

  // Get users by role (admin only)
  static getByRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.params;

    if (!role) {
      sendBadRequest(res, "Role is required");
      return;
    }

    if (!["admin", "teacher"].includes(role)) {
      sendBadRequest(res, "Role must be admin or teacher");
      return;
    }

    const users = await UserService.getByRole(role as "admin" | "teacher");
    sendSuccess(res, users, "Users retrieved successfully");
  });

  // Get teachers by department (admin only)
  static getTeachersByDepartment = asyncHandler(
    async (req: Request, res: Response) => {
      const { department } = req.params;

      if (!department) {
        sendBadRequest(res, "Department is required");
        return;
      }

      const teachers = await UserService.getTeachersByDepartment(department);
      sendSuccess(res, teachers, "Teachers retrieved successfully");
    }
  );

  // Get all users (simplified, admin only)
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    sendSuccess(res, users, "Users retrieved successfully");
  });

  // Get user statistics (admin only)
  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await UserService.getUserStats();
    sendSuccess(res, stats, "User statistics retrieved successfully");
  });

  // Search users (admin only)
  static searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { search, limit } = req.query;

    if (!search) {
      sendBadRequest(res, "Search term is required");
      return;
    }

    const searchLimit = limit ? parseInt(limit as string) : 10;
    const users = await UserService.searchUsers(search as string, searchLimit);
    sendSuccess(res, users, "Users retrieved successfully");
  });

  // Get user profile (self)
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      sendBadRequest(res, "User ID is required");
      return;
    }

    const user = await UserService.getById(userId);
    sendSuccess(res, user, "Profile retrieved successfully");
  });

  // Get teacher assignments (admin or self)
  static getTeacherAssignments = asyncHandler(
    async (req: Request, res: Response) => {
      const { teacherId } = req.params;

      if (!teacherId) {
        sendBadRequest(res, "Teacher ID is required");
        return;
      }

      const assignments = await UserService.getTeacherAssignments(teacherId);
      sendSuccess(
        res,
        assignments,
        "Teacher assignments retrieved successfully"
      );
    }
  );

  // Assign teacher to class (admin only)
  static assignTeacherToClass = asyncHandler(
    async (req: Request, res: Response) => {
      const { teacherId, classId, isPrimaryTeacher = false } = req.body;

      if (!teacherId || !classId) {
        sendBadRequest(res, "Teacher ID and Class ID are required");
        return;
      }

      const assignment = await UserService.assignTeacherToClass(
        teacherId,
        classId,
        isPrimaryTeacher
      );
      sendCreated(res, assignment, "Teacher assigned to class successfully");
    }
  );

  // Remove teacher from class (admin only)
  static removeTeacherFromClass = asyncHandler(
    async (req: Request, res: Response) => {
      const { teacherId, classId } = req.body;

      if (!teacherId || !classId) {
        sendBadRequest(res, "Teacher ID and Class ID are required");
        return;
      }

      await UserService.removeTeacherFromClass(teacherId, classId);
      sendSuccess(res, null, "Teacher removed from class successfully");
    }
  );
}
