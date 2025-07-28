import { eq, and, like, asc } from "drizzle-orm";

import {
  users,
  classes,
  teachers,
  teacherClass,
} from "@/db/schema";
import { db } from "@/db";
import type { NewTeacher } from "@/db/schema";
import { NotFoundError, ConflictError } from "@/types";

export class TeacherService {
  // Get all teachers with pagination and search
  static async getAll(
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

    let whereConditions = [];

    if (search) {
      whereConditions.push(like(teachers.employeeId, `%${search}%`));
    }

    if (department) {
      whereConditions.push(eq(teachers.department, department));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(teachers.isActive, isActive));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, totalCount] = await Promise.all([
      db
        .select({
          id: teachers.id,
          userId: teachers.userId,
          employeeId: teachers.employeeId,
          department: teachers.department,
          phone: teachers.phone,
          address: teachers.address,
          hireDate: teachers.hireDate,
          isActive: teachers.isActive,
          createdAt: teachers.createdAt,
          updatedAt: teachers.updatedAt,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
          },
        })
        .from(teachers)
        .leftJoin(users, eq(teachers.userId, users.id))
        .where(whereClause)
        .orderBy(asc(teachers.employeeId))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: teachers.id })
        .from(teachers)
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

  // Get teacher by ID
  static async getById(id: string) {
    const result = await db
      .select({
        id: teachers.id,
        userId: teachers.userId,
        employeeId: teachers.employeeId,
        department: teachers.department,
        phone: teachers.phone,
        address: teachers.address,
        hireDate: teachers.hireDate,
        isActive: teachers.isActive,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(teachers)
      .leftJoin(users, eq(teachers.userId, users.id))
      .where(eq(teachers.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError("Teacher not found");
    }

    return result[0]!;
  }

  // Get teacher by employee ID
  static async getByEmployeeId(employeeId: string) {
    const result = await db
      .select({
        id: teachers.id,
        userId: teachers.userId,
        employeeId: teachers.employeeId,
        department: teachers.department,
        phone: teachers.phone,
        address: teachers.address,
        hireDate: teachers.hireDate,
        isActive: teachers.isActive,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(teachers)
      .leftJoin(users, eq(teachers.userId, users.id))
      .where(eq(teachers.employeeId, employeeId))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError("Teacher not found");
    }

    return result[0]!;
  }

  // Get teacher by user ID
  static async getByUserId(userId: string) {
    const result = await db
      .select({
        id: teachers.id,
        userId: teachers.userId,
        employeeId: teachers.employeeId,
        department: teachers.department,
        phone: teachers.phone,
        address: teachers.address,
        hireDate: teachers.hireDate,
        isActive: teachers.isActive,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(teachers)
      .leftJoin(users, eq(teachers.userId, users.id))
      .where(eq(teachers.userId, userId))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError("Teacher not found");
    }

    return result[0]!;
  }

  // Create new teacher
  static async create(
    data: Omit<NewTeacher, "id" | "createdAt" | "updatedAt">
  ) {
    // Check if teacher with same employee ID already exists
    const existingTeacher = await db
      .select()
      .from(teachers)
      .where(eq(teachers.employeeId, data.employeeId))
      .limit(1);

    if (existingTeacher.length) {
      throw new ConflictError("Teacher with this employee ID already exists");
    }

    const result = await db.insert(teachers).values(data).returning();

    if (!result.length) {
      throw new Error("Failed to create teacher");
    }

    return result[0]!;
  }

  // Update teacher
  static async update(
    id: string,
    data: Partial<Omit<NewTeacher, "id" | "createdAt" | "updatedAt">>
  ) {
    // Check if teacher exists
    const existingTeacher = await this.getById(id);

    // If employee ID is being updated, check for conflicts
    if (data.employeeId && data.employeeId !== existingTeacher.employeeId) {
      const employeeIdConflict = await db
        .select()
        .from(teachers)
        .where(eq(teachers.employeeId, data.employeeId))
        .limit(1);

      if (employeeIdConflict.length) {
        throw new ConflictError("Teacher with this employee ID already exists");
      }
    }

    const result = await db
      .update(teachers)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(teachers.id, id))
      .returning();

    if (!result.length) {
      throw new Error("Failed to update teacher");
    }

    return result[0]!;
  }

  // Delete teacher (soft delete by setting isActive to false)
  static async delete(id: string): Promise<void> {
    const existingTeacher = await this.getById(id);

    await db
      .update(teachers)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(teachers.id, id));
  }

  // Get teacher's class assignments
  static async getAssignments(teacherId: string) {
    const result = await db
      .select({
        id: teacherClass.id,
        teacherId: teacherClass.teacherId,
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
        },
      })
      .from(teacherClass)
      .leftJoin(classes, eq(teacherClass.classId, classes.id))
      .where(eq(teacherClass.teacherId, teacherId));

    return result;
  }

  // Assign teacher to class
  static async assignToClass(
    teacherId: string,
    classId: string,
    isPrimaryTeacher: boolean = false
  ) {
    // Check if assignment already exists
    const existingAssignment = await db
      .select()
      .from(teacherClass)
      .where(
        and(
          eq(teacherClass.teacherId, teacherId),
          eq(teacherClass.classId, classId)
        )
      )
      .limit(1);

    if (existingAssignment.length) {
      throw new ConflictError(
        "Teacher is already assigned to this class"
      );
    }

    const result = await db
      .insert(teacherClass)
      .values({
        teacherId,
        classId,
        isPrimaryTeacher,
        isActive: true,
      })
      .returning();

    if (!result.length) {
      throw new Error("Failed to create teacher assignment");
    }

    return result[0]!;
  }

  // Remove teacher from class assignment
  static async removeFromClass(
    teacherId: string,
    classId: string
  ): Promise<void> {
    const result = await db
      .delete(teacherClass)
      .where(
        and(
          eq(teacherClass.teacherId, teacherId),
          eq(teacherClass.classId, classId)
        )
      );

    if (!result) {
      throw new Error("Failed to remove teacher assignment");
    }
  }

  // Get teachers by department
  static async getByDepartment(department: string) {
    return db
      .select({
        id: teachers.id,
        userId: teachers.userId,
        employeeId: teachers.employeeId,
        department: teachers.department,
        phone: teachers.phone,
        address: teachers.address,
        hireDate: teachers.hireDate,
        isActive: teachers.isActive,
        createdAt: teachers.createdAt,
        updatedAt: teachers.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(teachers)
      .leftJoin(users, eq(teachers.userId, users.id))
      .where(
        and(eq(teachers.department, department), eq(teachers.isActive, true))
      )
      .orderBy(asc(teachers.employeeId));
  }
}
