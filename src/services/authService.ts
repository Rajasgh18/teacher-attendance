import jwt from "jsonwebtoken";

import {
  RegisterData,
  TokenPayload,
  LoginCredentials,
  UserWithoutPassword,
} from "@/types";
import { config } from "@/config";
import { UserService } from "@/services/userService";

export class AuthService {
  static async register(data: RegisterData): Promise<{
    user: UserWithoutPassword;
    token: string;
    refreshToken: string;
  }> {
    // Check if user already exists
    const existingUser = await UserService.getByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const user = await UserService.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.generateToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    return { user: user as UserWithoutPassword, token, refreshToken };
  }

  static async login(credentials: LoginCredentials): Promise<{
    user: UserWithoutPassword;
    token: string;
    refreshToken: string;
  }> {
    // Find user by email
    const user = await UserService.getByEmail(credentials.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await UserService.verifyPassword(
      user.id,
      credentials.password
    );
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.generateToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    return { user, token, refreshToken };
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as TokenPayload;

      // Check if user still exists
      const user = await UserService.getById(payload.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate new tokens
      const newTokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newToken = this.generateToken(newTokenPayload);
      const newRefreshToken = this.generateRefreshToken(newTokenPayload);

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user
    const user = await UserService.getById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValidPassword = await UserService.verifyPassword(
      user.id,
      currentPassword
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Update password
    await UserService.updatePassword(userId, newPassword);
  }

  static async forgotPassword(email: string): Promise<void> {
    // Check if user exists
    const user = await UserService.getByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    // TODO: Implement email sending logic
    // For now, just log the request
    console.log(`Password reset requested for: ${email}`);
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Verify reset token
      const payload = jwt.verify(token, config.jwt.resetSecret) as {
        userId: string;
      };

      // Update password
      await UserService.updatePassword(payload.userId, newPassword);
    } catch (error) {
      throw new Error("Invalid or expired reset token");
    }
  }

  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);
  }

  static generateResetToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.resetSecret, {
      expiresIn: "1h", // Reset tokens expire in 1 hour
    });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
