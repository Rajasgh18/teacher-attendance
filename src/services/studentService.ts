import { eq, and, like, asc } from "drizzle-orm";

import {
  students,
  classes,
  studentAttendance,
  subjects,
  users,
} from "@/db/schema";
import { db } from "@/db";
import type { NewStudent } from "@/db/schema";
import { NotFoundError, ConflictError } from "@/types";

export class StudentService {
  // Get all students with pagination and search
  static async getAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      classId?: string;
      gender?: string;
      isActive?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 10, search, classId, gender, isActive } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        and(
          like(students.firstName, `%${search}%`),
          like(students.lastName, `%${search}%`)
        )
      );
    }

    if (classId) {
      whereConditions.push(eq(students.classId, classId));
    }

    if (gender) {
      whereConditions.push(
        eq(students.gender, gender as "male" | "female" | "other")
      );
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(students.isActive, isActive));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, totalCount] = await Promise.all([
      db
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
          class: {
            id: classes.id,
            name: classes.name,
            grade: classes.grade,
            section: classes.section,
            academicYear: classes.academicYear,
          },
        })
        .from(students)
        .leftJoin(classes, eq(students.classId, classes.id))
        .where(whereClause)
        .orderBy(asc(students.studentId))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: students.id })
        .from(students)
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

  // Get student by ID
  static async getById(id: string) {
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
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
          academicYear: classes.academicYear,
        },
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError("Student not found");
    }

    return result[0]!;
  }

  // Get student by student ID
  static async getByStudentId(studentId: string) {
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
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
          academicYear: classes.academicYear,
        },
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.studentId, studentId))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError("Student not found");
    }

    return result[0]!;
  }

  // Create new student
  static async create(
    data: Omit<NewStudent, "id" | "createdAt" | "updatedAt">
  ) {
    // Check if student with same student ID already exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.studentId, data.studentId))
      .limit(1);

    if (existingStudent.length) {
      throw new ConflictError("Student with this ID already exists");
    }

    // Check if student with same email already exists
    const existingEmail = await db
      .select()
      .from(students)
      .where(eq(students.email, data.email))
      .limit(1);

    if (existingEmail.length) {
      throw new ConflictError("Student with this email already exists");
    }

    const result = await db.insert(students).values(data).returning();

    if (!result.length) {
      throw new Error("Failed to create student");
    }

    return result[0]!;
  }

  // Update student
  static async update(
    id: string,
    data: Partial<Omit<NewStudent, "id" | "createdAt" | "updatedAt">>
  ) {
    // Check if student exists
    const existingStudent = await this.getById(id);

    // If student ID is being updated, check for conflicts
    if (data.studentId && data.studentId !== existingStudent.studentId) {
      const studentIdConflict = await db
        .select()
        .from(students)
        .where(eq(students.studentId, data.studentId))
        .limit(1);

      if (studentIdConflict.length) {
        throw new ConflictError("Student with this ID already exists");
      }
    }

    // If email is being updated, check for conflicts
    if (data.email && data.email !== existingStudent.email) {
      const emailConflict = await db
        .select()
        .from(students)
        .where(eq(students.email, data.email))
        .limit(1);

      if (emailConflict.length) {
        throw new ConflictError("Student with this email already exists");
      }
    }

    const result = await db
      .update(students)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();

    if (!result.length) {
      throw new Error("Failed to update student");
    }

    return result[0]!;
  }

  // Delete student (soft delete by setting isActive to false)
  static async delete(id: string): Promise<void> {
    const existingStudent = await this.getById(id);

    await db
      .update(students)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id));
  }

  // Get student's attendance records
  static async getAttendance(
    studentId: string,
    query: {
      startDate?: string;
      endDate?: string;
      subjectId?: string;
      classId?: string;
    } = {}
  ) {
    const { startDate, endDate, subjectId, classId } = query;

    let whereConditions = [eq(studentAttendance.studentId, studentId)];

    if (startDate) {
      whereConditions.push(eq(studentAttendance.date, startDate));
    }

    if (endDate) {
      whereConditions.push(eq(studentAttendance.date, endDate));
    }

    if (subjectId) {
      whereConditions.push(eq(studentAttendance.subjectId, subjectId));
    }

    if (classId) {
      whereConditions.push(eq(studentAttendance.classId, classId));
    }

    const whereClause = and(...whereConditions);

    const result = await db
      .select({
        id: studentAttendance.id,
        studentId: studentAttendance.studentId,
        classId: studentAttendance.classId,
        subjectId: studentAttendance.subjectId,
        date: studentAttendance.date,
        status: studentAttendance.status,
        notes: studentAttendance.notes,
        markedBy: studentAttendance.markedBy,
        createdAt: studentAttendance.createdAt,
        updatedAt: studentAttendance.updatedAt,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        },
        markedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(studentAttendance)
      .leftJoin(subjects, eq(studentAttendance.subjectId, subjects.id))
      .leftJoin(users, eq(studentAttendance.markedBy, users.id))
      .where(whereClause)
      .orderBy(asc(studentAttendance.date));

    return result;
  }

  // Get students by class
  static async getByClass(classId: string) {
    return db
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
      .where(and(eq(students.classId, classId), eq(students.isActive, true)))
      .orderBy(asc(students.studentId));
  }

  // Get students by gender
  static async getByGender(gender: string) {
    return db
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
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
          academicYear: classes.academicYear,
        },
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(
        and(
          eq(students.gender, gender as "male" | "female" | "other"),
          eq(students.isActive, true)
        )
      )
      .orderBy(asc(students.studentId));
  }

  // Get active students only
  static async getActive() {
    return db
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
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
          academicYear: classes.academicYear,
        },
      })
      .from(students)
      .leftJoin(classes, eq(students.classId, classes.id))
      .where(eq(students.isActive, true))
      .orderBy(asc(students.studentId));
  }
}
