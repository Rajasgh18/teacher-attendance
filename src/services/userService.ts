import bcrypt from "bcryptjs";
import { eq, and, like, asc, desc, or, ne } from "drizzle-orm";

import { db } from "@/db";
import { config } from "@/config";
import type { NewUser } from "@/db/schema";
import { users, teacherClass, classes } from "@/db/schema";
import { NotFoundError, ConflictError } from "@/types";

export class UserService {
  // Get all users with pagination and search
  static async getAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      department?: string;
      isActive?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 10, search, role, department, isActive } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.employeeId, `%${search}%`)
        )
      );
    }

    if (role) {
      whereConditions.push(
        eq(users.role, role as "admin" | "teacher")
      );
    }

    if (department) {
      whereConditions.push(eq(users.department, department));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(users.isActive, isActive));
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
          employeeId: users.employeeId,
          department: users.department,
          phone: users.phone,
          address: users.address,
          hireDate: users.hireDate,
          isActive: users.isActive,
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
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
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
        passwordHash: users.passwordHash,
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
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

  // Get teacher by employee ID
  static async getByEmployeeId(employeeId: string) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(and(eq(users.employeeId, employeeId), eq(users.role, "teacher")));

    if (!user) {
      throw new NotFoundError("Teacher not found");
    }

    return user;
  }

  // Get all teachers
  static async getAllTeachers(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      department?: string;
      isActive?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 10, search, department, isActive } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [eq(users.role, "teacher")];

    if (search) {
      whereConditions.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.employeeId, `%${search}%`)
        )
      );
    }

    if (department) {
      whereConditions.push(eq(users.department, department));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(users.isActive, isActive));
    }

    const whereClause = and(...whereConditions);

    const [data, totalCount] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          employeeId: users.employeeId,
          department: users.department,
          phone: users.phone,
          address: users.address,
          hireDate: users.hireDate,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(asc(users.employeeId))
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

  // Get teachers by department
  static async getTeachersByDepartment(department: string) {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(and(eq(users.department, department), eq(users.role, "teacher")))
      .orderBy(asc(users.firstName));
  }

  // Create new user
  static async create(
    data: Omit<NewUser, "id" | "createdAt" | "updatedAt" | "passwordHash"> & {
      password: string;
    }
  ) {
    const { password, ...userData } = data;

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userData.email));

    if (existingUser.length > 0) {
      throw new ConflictError("User with this email already exists");
    }

    // Check if employee ID already exists for teachers
    if (userData.role === "teacher" && userData.employeeId) {
      const existingTeacher = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.employeeId, userData.employeeId));

      if (existingTeacher.length > 0) {
        throw new ConflictError("Teacher with this employee ID already exists");
      }
    }

    // Hash password
    const saltRounds = config.security.bcryptRounds;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [newUser] = await db
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
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return newUser;
  }

  // Update user
  static async update(
    id: string,
    data: Partial<
      Omit<NewUser, "id" | "createdAt" | "updatedAt" | "passwordHash">
    >
  ) {
    // Check if user exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id));

    if (existingUser.length === 0) {
      throw new NotFoundError("User not found");
    }

    // Check if email is being updated and if it already exists
    if (data.email) {
      const emailExists = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, data.email), ne(users.id, id)));

      if (emailExists.length > 0) {
        throw new ConflictError("User with this email already exists");
      }
    }

    // Check if employee ID is being updated and if it already exists for teachers
    if (data.employeeId) {
      const employeeIdExists = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.employeeId, data.employeeId), ne(users.id, id)));

      if (employeeIdExists.length > 0) {
        throw new ConflictError("Teacher with this employee ID already exists");
      }
    }

    const [updatedUser] = await db
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
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUser;
  }

  // Update password
  static async updatePassword(id: string, newPassword: string) {
    const saltRounds = config.security.bcryptRounds;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // Delete user (soft delete)
  static async delete(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // Hard delete user
  static async hardDelete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Get users by role
  static async getByRole(role: "admin" | "teacher") {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.role, role))
      .orderBy(asc(users.firstName));
  }

  // Get all users (simplified)
  static async getAllUsers() {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(asc(users.firstName));
  }

  // Get teacher class assignments
  static async getTeacherAssignments(teacherId: string) {
    return await db
      .select({
        id: teacherClass.id,
        classId: teacherClass.classId,
        isPrimaryTeacher: teacherClass.isPrimaryTeacher,
        isActive: teacherClass.isActive,
        createdAt: teacherClass.createdAt,
        updatedAt: teacherClass.updatedAt,
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
          academicYear: classes.academicYear,
          isActive: classes.isActive,
        },
      })
      .from(teacherClass)
      .leftJoin(classes, eq(teacherClass.classId, classes.id))
      .where(eq(teacherClass.teacherId, teacherId));
  }

  // Assign teacher to class
  static async assignTeacherToClass(
    teacherId: string,
    classId: string,
    isPrimaryTeacher: boolean = false
  ) {
    // Check if assignment already exists
    const existingAssignment = await db
      .select({ id: teacherClass.id })
      .from(teacherClass)
      .where(and(eq(teacherClass.teacherId, teacherId), eq(teacherClass.classId, classId)));

    if (existingAssignment.length > 0) {
      throw new ConflictError("Teacher is already assigned to this class");
    }

    const [assignment] = await db
      .insert(teacherClass)
      .values({
        teacherId,
        classId,
        isPrimaryTeacher,
        isActive: true,
      })
      .returning();

    return assignment;
  }

  // Remove teacher from class
  static async removeTeacherFromClass(
    teacherId: string,
    classId: string
  ): Promise<void> {
    await db
      .delete(teacherClass)
      .where(and(eq(teacherClass.teacherId, teacherId), eq(teacherClass.classId, classId)));
  }

  // Verify password
  static async verifyPassword(
    userId: string,
    password: string
  ): Promise<boolean> {
    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.passwordHash);
  }

  // Change password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    const saltRounds = config.security.bcryptRounds;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Get user statistics
  static async getUserStats() {
    const [totalUsers, totalTeachers, totalAdmins] = await Promise.all([
      db.select({ count: users.id }).from(users).then(result => result.length),
      db
        .select({ count: users.id })
        .from(users)
        .where(eq(users.role, "teacher"))
        .then(result => result.length),
      db
        .select({ count: users.id })
        .from(users)
        .where(eq(users.role, "admin"))
        .then(result => result.length),
    ]);

    return {
      totalUsers,
      totalTeachers,
      totalAdmins,
    };
  }

  // Search users
  static async searchUsers(searchTerm: string, limit = 10) {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        employeeId: users.employeeId,
        department: users.department,
        phone: users.phone,
        address: users.address,
        hireDate: users.hireDate,
        isActive: users.isActive,
      })
      .from(users)
      .where(
        or(
          like(users.firstName, `%${searchTerm}%`),
          like(users.lastName, `%${searchTerm}%`),
          like(users.email, `%${searchTerm}%`),
          like(users.employeeId, `%${searchTerm}%`)
        )
      )
      .limit(limit)
      .orderBy(asc(users.firstName));
  }
}
