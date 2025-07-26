import { Request, Response } from "express";

import { UserService } from "@/services/userService";
import { asyncHandler } from "@/middleware/errorHandler";
import { sendSuccess, sendCreated, sendBadRequest } from "@/utils/response";

export class UserController {
  // Get all users (admin only)
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, role } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (role) query.role = role as string;

    const result = await UserService.getAll(query);
    sendSuccess(res, result, "Users retrieved successfully");
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
    const { email, password, firstName, lastName, role } = req.body;

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

    if (!["admin", "principal", "teacher"].includes(role)) {
      sendBadRequest(res, "Role must be admin, principal, or teacher");
      return;
    }

    if (password.length < 8) {
      sendBadRequest(res, "Password must be at least 8 characters long");
      return;
    }

    const user = await UserService.create({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    sendCreated(res, user, "User created successfully");
  });

  // Update user (admin only, or self)
  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, firstName, lastName, role } = req.body;

    if (!id) {
      sendBadRequest(res, "User ID is required");
      return;
    }

    const updateData: any = {};
    if (email !== undefined) {
      if (email.length > 255) {
        sendBadRequest(res, "Email must be 255 characters or less");
        return;
      }
      updateData.email = email;
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

    if (role !== undefined) {
      if (!["admin", "principal", "teacher"].includes(role)) {
        sendBadRequest(res, "Role must be admin, principal, or teacher");
        return;
      }
      updateData.role = role;
    }

    const user = await UserService.update(id, updateData);
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

  // Change user password (with current password verification)
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
      sendBadRequest(res, "Password must be at least 8 characters long");
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
      sendBadRequest(res, "Role parameter is required");
      return;
    }

    if (!["admin", "principal", "teacher"].includes(role)) {
      sendBadRequest(res, "Role must be admin, principal, or teacher");
      return;
    }

    const users = await UserService.getByRole(
      role as "admin" | "principal" | "teacher"
    );
    sendSuccess(res, users, "Users retrieved successfully");
  });

  // Get all users (admin only)
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    sendSuccess(res, users, "Users retrieved successfully");
  });

  // Get users with teacher profiles (admin and principal only)
  static getWithTeacherProfiles = asyncHandler(
    async (req: Request, res: Response) => {
      const users = await UserService.getWithTeacherProfiles();
      sendSuccess(
        res,
        users,
        "Users with teacher profiles retrieved successfully"
      );
    }
  );

  // Get user statistics (admin only)
  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await UserService.getUserStats();
    sendSuccess(res, stats, "User statistics retrieved successfully");
  });

  // Search users (admin only)
  static searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { q, limit } = req.query;

    if (!q) {
      sendBadRequest(res, "Search query is required");
      return;
    }

    const searchLimit = limit ? parseInt(limit as string) : 10;
    const users = await UserService.searchUsers(q as string, searchLimit);
    sendSuccess(res, users, "Users search completed successfully");
  });

  // Get current user profile (self access)
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      sendBadRequest(res, "User not authenticated");
      return;
    }

    const user = await UserService.getById(userId);
    sendSuccess(res, user, "User profile retrieved successfully");
  });
}
