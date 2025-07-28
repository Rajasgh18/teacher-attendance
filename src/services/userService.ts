import bcrypt from "bcryptjs";
import { eq, and, like, asc, desc } from "drizzle-orm";

import { db } from "@/db";
import { config } from "@/config";
import type { NewUser } from "@/db/schema";
import { users, teachers } from "@/db/schema";
import { NotFoundError, ConflictError } from "@/types";

export class UserService {
  // Get all users with pagination and search
  static async getAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, search, role } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        and(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (role) {
      whereConditions.push(
        eq(users.role, role as "admin" | "principal" | "teacher")
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, totalCount] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: users.id })
        .from(users)
        .where(whereClause)
        .then(result => result.length),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  // Get user by ID
  static async getById(id: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  // Get user by email
  static async getByEmail(email: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  // Create new user
  static async create(
    data: Omit<NewUser, "id" | "createdAt" | "updatedAt" | "passwordHash"> & {
      password: string;
    }
  ) {
    // Check if user with same email already exists
    const existingUser = await this.getByEmail(data.email).catch(() => null);

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const { password, ...userData } = data;
    const passwordHash = await bcrypt.hash(
      password,
      config.security.bcryptRounds
    );

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  // Update user
  static async update(
    id: string,
    data: Partial<
      Omit<NewUser, "id" | "createdAt" | "updatedAt" | "passwordHash">
    >
  ) {
    // Check if user exists
    const existingUser = await this.getById(id);

    // If email is being updated, check for conflicts
    if (data.email && data.email !== existingUser.email) {
      const emailConflict = await this.getByEmail(data.email).catch(() => null);

      if (emailConflict) {
        throw new ConflictError("User with this email already exists");
      }
    }

    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!user) {
      throw new Error("Failed to update user");
    }

    return user;
  }

  // Update user password
  static async updatePassword(id: string, newPassword: string) {
    // Check if user exists
    await this.getById(id);

    const passwordHash = await bcrypt.hash(
      newPassword,
      config.security.bcryptRounds
    );

    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // Delete user (hard delete)
  static async delete(id: string): Promise<void> {
    await this.getById(id);

    await db.delete(users).where(eq(users.id, id));
  }

  // Hard delete user
  static async hardDelete(id: string): Promise<void> {
    await this.getById(id);

    await db.delete(users).where(eq(users.id, id));
  }

  // Get users by role
  static async getByRole(role: "admin" | "principal" | "teacher") {
    return db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.role, role))
      .orderBy(desc(users.createdAt));
  }

  // Get all users
  static async getAllUsers() {
    return db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  // Get users with teacher profiles
  static async getWithTeacherProfiles() {
    return db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        teacher: {
          id: teachers.id,
          employeeId: teachers.employeeId,
          department: teachers.department,
          phone: teachers.phone,
          address: teachers.address,
          hireDate: teachers.hireDate,
          isActive: teachers.isActive,
        },
      })
      .from(users)
      .leftJoin(teachers, eq(users.id, teachers.userId))
      .where(eq(users.role, "teacher"))
      .orderBy(desc(users.createdAt));
  }

  // Verify user password
  static async verifyPassword(
    userId: string,
    password: string
  ): Promise<boolean> {
    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return await bcrypt.compare(password, user.passwordHash);
  }

  // Change user password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Update to new password
    const passwordHash = await bcrypt.hash(
      newPassword,
      config.security.bcryptRounds
    );

    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Get user statistics
  static async getUserStats() {
    const [totalUsers, adminCount, principalCount, teacherCount] =
      await Promise.all([
        db
          .select({ count: users.id })
          .from(users)
          .then(result => result.length),
        db
          .select({ count: users.id })
          .from(users)
          .where(eq(users.role, "admin"))
          .then(result => result.length),
        db
          .select({ count: users.id })
          .from(users)
          .where(eq(users.role, "principal"))
          .then(result => result.length),
        db
          .select({ count: users.id })
          .from(users)
          .where(eq(users.role, "teacher"))
          .then(result => result.length),
      ]);

    return {
      totalUsers,
      adminCount,
      principalCount,
      teacherCount,
    };
  }

  // Search users
  static async searchUsers(searchTerm: string, limit = 10) {
    return db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(
        and(
          like(users.firstName, `%${searchTerm}%`),
          like(users.lastName, `%${searchTerm}%`),
          like(users.email, `%${searchTerm}%`)
        )
      )
      .orderBy(asc(users.firstName))
      .limit(limit);
  }
}
