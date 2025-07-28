import { Request, Response } from "express";

import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendUnauthorized,
} from "@/utils/response";
import { AuthService } from "@/services/authService";
import { UserService } from "@/services/userService";
import { asyncHandler } from "@/middleware/errorHandler";
import { LoginCredentials, RegisterData } from "@/types";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role = "teacher" } = req.body;

    const registerData: RegisterData = {
      email,
      password,
      firstName,
      lastName,
      role,
    };

    try {
      const result = await AuthService.register(registerData);

      sendCreated(
        res,
        {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
          tokens: {
            accessToken: result.token,
            refreshToken: result.refreshToken,
          },
        },
        "User registered successfully"
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "User with this email already exists"
      ) {
        sendBadRequest(res, error.message);
      } else {
        throw error;
      }
    }
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const credentials: LoginCredentials = {
      email,
      password,
    };

    try {
      const result = await AuthService.login(credentials);
      sendSuccess(
        res,
        {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
          tokens: {
            accessToken: result.token,
            refreshToken: result.refreshToken,
          },
        },
        "Login successful"
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid credentials") {
        sendUnauthorized(res, error.message);
      } else {
        throw error;
      }
    }
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendBadRequest(res, "Refresh token is required");
      return;
    }

    try {
      const result = await AuthService.refreshToken(refreshToken);

      sendSuccess(
        res,
        {
          tokens: {
            accessToken: result.token,
            refreshToken: result.refreshToken,
          },
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid refresh token") {
        sendUnauthorized(res, error.message);
      } else {
        throw error;
      }
    }
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement token blacklisting if needed
    // For now, just return success - client should discard tokens

    sendSuccess(res, null, "Logout successful");
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendUnauthorized(res, "User not authenticated");
      return;
    }

    const user = await UserService.getById(userId);
    if (!user) {
      sendNotFound(res, "User not found");
      return;
    }

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      "Profile retrieved successfully"
    );
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      sendUnauthorized(res, "User not authenticated");
      return;
    }

    try {
      await AuthService.changePassword(userId, currentPassword, newPassword);
      sendSuccess(res, null, "Password changed successfully");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
          sendNotFound(res, error.message);
        } else if (error.message === "Current password is incorrect") {
          sendBadRequest(res, error.message);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  });

  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      await AuthService.forgotPassword(email);
      sendSuccess(res, null, "Password reset email sent successfully");
    } catch (error) {
      throw error;
    }
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
      await AuthService.resetPassword(token, newPassword);
      sendSuccess(res, null, "Password reset successfully");
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Invalid or expired reset token"
      ) {
        sendBadRequest(res, error.message);
      } else {
        throw error;
      }
    }
  });
}
