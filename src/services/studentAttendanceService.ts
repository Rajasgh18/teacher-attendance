import { eq, and, asc, desc } from "drizzle-orm";

import { db } from "@/db";
import { NewStudentAttendance } from "@/db/schema";
import { studentAttendance, students, classes, users } from "@/db/schema";

export class StudentAttendanceService {
  // Get all student attendance records with pagination
  static async getAll(
    query: {
      page?: number;
      limit?: number;
      studentId?: string;
      classId?: string;
      date?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, studentId, classId, date } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (studentId) {
      whereConditions.push(eq(studentAttendance.studentId, studentId));
    }

    if (classId) {
      whereConditions.push(eq(studentAttendance.classId, classId));
    }

    if (date) {
      whereConditions.push(eq(studentAttendance.date, date));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const result = await db
      .select({
        id: studentAttendance.id,
        studentId: studentAttendance.studentId,
        classId: studentAttendance.classId,
        date: studentAttendance.date,
        status: studentAttendance.status,
        notes: studentAttendance.notes,
        markedBy: studentAttendance.markedBy,
        createdAt: studentAttendance.createdAt,
        updatedAt: studentAttendance.updatedAt,
        student: {
          id: students.id,
          studentId: students.studentId,
          firstName: students.firstName,
          lastName: students.lastName,
          email: students.email,
        },
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
        },
        markedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(studentAttendance)
      .leftJoin(students, eq(studentAttendance.studentId, students.id))
      .leftJoin(classes, eq(studentAttendance.classId, classes.id))
      .leftJoin(users, eq(studentAttendance.markedBy, users.id))
      .where(whereClause)
      .orderBy(desc(studentAttendance.date), asc(studentAttendance.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: db.$count(studentAttendance.id) })
      .from(studentAttendance)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);

    return {
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get student attendance by ID
  static async getById(id: string) {
    const result = await db
      .select({
        id: studentAttendance.id,
        studentId: studentAttendance.studentId,
        classId: studentAttendance.classId,
        date: studentAttendance.date,
        status: studentAttendance.status,
        notes: studentAttendance.notes,
        markedBy: studentAttendance.markedBy,
        createdAt: studentAttendance.createdAt,
        updatedAt: studentAttendance.updatedAt,
        student: {
          id: students.id,
          studentId: students.studentId,
          firstName: students.firstName,
          lastName: students.lastName,
          email: students.email,
        },
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
        },
        markedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(studentAttendance)
      .leftJoin(students, eq(studentAttendance.studentId, students.id))
      .leftJoin(classes, eq(studentAttendance.classId, classes.id))
      .leftJoin(users, eq(studentAttendance.markedBy, users.id))
      .where(eq(studentAttendance.id, id))
      .limit(1);

    return result[0];
  }

  // Get student attendance by class
  static async getByClass(classId: string, query: { date?: string } = {}) {
    const { date } = query;

    let whereConditions = [eq(studentAttendance.classId, classId)];

    if (date) {
      whereConditions.push(eq(studentAttendance.date, date));
    }

    const whereClause = and(...whereConditions);

    const result = await db
      .select({
        id: studentAttendance.id,
        studentId: studentAttendance.studentId,
        classId: studentAttendance.classId,
        date: studentAttendance.date,
        status: studentAttendance.status,
        notes: studentAttendance.notes,
        markedBy: studentAttendance.markedBy,
        createdAt: studentAttendance.createdAt,
        updatedAt: studentAttendance.updatedAt,
        student: {
          id: students.id,
          studentId: students.studentId,
          firstName: students.firstName,
          lastName: students.lastName,
          email: students.email,
        },
        markedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(studentAttendance)
      .leftJoin(students, eq(studentAttendance.studentId, students.id))
      .leftJoin(users, eq(studentAttendance.markedBy, users.id))
      .where(whereClause)
      .orderBy(asc(studentAttendance.date), asc(students.firstName));

    return result;
  }

  // Get student attendance by student
  static async getByStudent(
    studentId: string,
    query: {
      startDate?: string;
      endDate?: string;
      classId?: string;
    } = {}
  ) {
    const { startDate, endDate, classId } = query;

    let whereConditions = [eq(studentAttendance.studentId, studentId)];

    if (startDate) {
      whereConditions.push(eq(studentAttendance.date, startDate));
    }

    if (endDate) {
      whereConditions.push(eq(studentAttendance.date, endDate));
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
        date: studentAttendance.date,
        status: studentAttendance.status,
        notes: studentAttendance.notes,
        markedBy: studentAttendance.markedBy,
        createdAt: studentAttendance.createdAt,
        updatedAt: studentAttendance.updatedAt,
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
        },
        markedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(studentAttendance)
      .leftJoin(classes, eq(studentAttendance.classId, classes.id))
      .leftJoin(users, eq(studentAttendance.markedBy, users.id))
      .where(whereClause)
      .orderBy(desc(studentAttendance.date));

    return result;
  }

  // Get student attendance by date
  static async getByDate(date: string, query: { classId?: string } = {}) {
    const { classId } = query;

    let whereConditions = [eq(studentAttendance.date, date)];

    if (classId) {
      whereConditions.push(eq(studentAttendance.classId, classId));
    }

    const whereClause = and(...whereConditions);

    const result = await db
      .select({
        id: studentAttendance.id,
        studentId: studentAttendance.studentId,
        classId: studentAttendance.classId,
        date: studentAttendance.date,
        status: studentAttendance.status,
        notes: studentAttendance.notes,
        markedBy: studentAttendance.markedBy,
        createdAt: studentAttendance.createdAt,
        updatedAt: studentAttendance.updatedAt,
        student: {
          id: students.id,
          studentId: students.studentId,
          firstName: students.firstName,
          lastName: students.lastName,
          email: students.email,
        },
        class: {
          id: classes.id,
          name: classes.name,
          grade: classes.grade,
          section: classes.section,
        },
        markedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(studentAttendance)
      .leftJoin(students, eq(studentAttendance.studentId, students.id))
      .leftJoin(classes, eq(studentAttendance.classId, classes.id))
      .leftJoin(users, eq(studentAttendance.markedBy, users.id))
      .where(whereClause)
      .orderBy(asc(students.firstName));

    return result;
  }

  // Create student attendance record
  static async create(attendanceData: NewStudentAttendance) {
    const result = await db
      .insert(studentAttendance)
      .values(attendanceData)
      .returning();
    return result[0];
  }

  // Update student attendance record
  static async update(id: string, updateData: Partial<NewStudentAttendance>) {
    const result = await db
      .update(studentAttendance)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(studentAttendance.id, id))
      .returning();
    return result[0];
  }

  // Delete student attendance record
  static async delete(id: string) {
    await db.delete(studentAttendance).where(eq(studentAttendance.id, id));
  }
}
