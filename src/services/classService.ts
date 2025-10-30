import { eq, and, like, asc, desc } from "drizzle-orm";

import { classes, students, teacherAssignments, users } from "@/db/schema";
import { db } from "@/db";
import type { NewClass } from "@/db/schema";
import { NotFoundError, ConflictError } from "@/types";

export class ClassService {
  // Get all classes with pagination and search
  static async getBy(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      schoolId?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, search, schoolId } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(like(classes.name, `%${search}%`));
    }

    if (schoolId) {
      whereConditions.push(eq(classes.schoolId, schoolId));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, totalCount] = await Promise.all([
      db
        .select()
        .from(classes)
        .where(whereClause)
        .orderBy(asc(classes.name))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: classes.id })
        .from(classes)
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

  // Get class by ID
  static async getById(id: string) {
    const result = await db
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError("Class not found");
    }

    return result[0]!;
  }

  // Create new class
  static async create(data: Omit<NewClass, "id" | "createdAt" | "updatedAt">) {
    // Check if class with same name and grade already exists
    const existingClass = await db
      .select()
      .from(classes)
      .where(and(eq(classes.name, data.name), eq(classes.grade, data.grade)))
      .limit(1);

    if (existingClass.length) {
      throw new ConflictError("Class with this name and grade already exists");
    }

    const result = await db.insert(classes).values(data).returning();

    if (!result.length) {
      throw new Error("Failed to create class");
    }

    return result[0]!;
  }

  // Update class
  static async update(
    id: string,
    data: Partial<Omit<NewClass, "id" | "createdAt" | "updatedAt">>
  ) {
    // Check if class exists
    const existingClass = await this.getById(id);

    // If name or grade is being updated, check for conflicts
    if (
      (data.name && data.name !== existingClass.name) ||
      (data.grade && data.grade !== existingClass.grade)
    ) {
      const nameConflict = await db
        .select()
        .from(classes)
        .where(
          and(
            eq(classes.name, data.name || existingClass.name),
            eq(classes.grade, data.grade || existingClass.grade)
          )
        )
        .limit(1);

      if (nameConflict.length) {
        throw new ConflictError(
          "Class with this name and grade already exists"
        );
      }
    }

    const result = await db
      .update(classes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, id))
      .returning();

    if (!result.length) {
      throw new Error("Failed to update class");
    }

    return result[0]!;
  }

  // Delete class (soft delete by setting isActive to false)
  static async delete(id: string): Promise<void> {
    const existingClass = await this.getById(id);

    await db
      .update(classes)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(classes.id, id));
  }

  // Get students in a class
  static async getStudents(query: { classId?: string; schoolId?: string }) {
    const { classId, schoolId } = query;
    let whereConditions = [];

    if (classId) {
      whereConditions.push(eq(students.classId, classId));
    }

    if (schoolId) {
      whereConditions.push(eq(students.schoolId, schoolId));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const result = await db
      .select({
        id: students.id,
        classId: students.classId,
        studentId: students.studentId,
        firstName: students.firstName,
        lastName: students.lastName,
        email: students.email,
        phone: students.phone,
        address: students.address,
        dateOfBirth: students.dateOfBirth,
        gender: students.gender,
        isActive: students.isActive,
        createdAt: students.createdAt,
        updatedAt: students.updatedAt,
      })
      .from(students)
      .where(whereClause)
      .orderBy(asc(students.studentId));

    return result;
  }

  // Get class with teacher assignments
  static async getTeachers(query: { classId?: string; schoolId?: string }) {
    const { classId, schoolId } = query;
    let whereConditions = [];

    if (classId) {
      whereConditions.push(eq(students.classId, classId));
    }

    if (schoolId) {
      whereConditions.push(eq(students.schoolId, schoolId));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const result = await db
      .select({
        id: teacherAssignments.id,
        teacherId: teacherAssignments.teacherId,
        classId: teacherAssignments.classId,
        isPrimaryTeacher: teacherAssignments.isPrimaryTeacher,
        isActive: teacherAssignments.isActive,
        createdAt: teacherAssignments.createdAt,
        updatedAt: teacherAssignments.updatedAt,
        teacher: {
          id: users.id,
          employeeId: users.employeeId,
          department: users.department,
          phone: users.phone,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(teacherAssignments)
      .leftJoin(users, eq(teacherAssignments.teacherId, users.id))
      .where(whereClause);

    return result;
  }
}
