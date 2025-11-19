import { eq, and, asc, desc } from "drizzle-orm";

import { db } from "@/db";
import {
  NewStudentAttendance,
  NewTeacherAttendance,
  teacherAttendance,
} from "@/db/schema";
import { studentAttendance, students, classes, users } from "@/db/schema";

export class AttendanceService {
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

    const [data, totalCount] = await Promise.all([
      db
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
        .offset(offset),
      db
        .select({ count: studentAttendance.id })
        .from(studentAttendance)
        .where(whereClause)
        .then(result => result.length),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async getTeacherAttendanceById(id: string) {
    const result = await db
      .select({
        id: teacherAttendance.id,
        teacherId: teacherAttendance.teacherId,
        latitude: teacherAttendance.latitude,
        longitude: teacherAttendance.longitude,
        checkIn: teacherAttendance.checkIn,
        status: teacherAttendance.status,
        notes: teacherAttendance.notes,
        createdAt: teacherAttendance.createdAt,
        updatedAt: teacherAttendance.updatedAt,
        teacher: {
          id: users.id,
          schoolId: users.schoolId,
          email: users.email,
          role: users.role,
          firstName: users.firstName,
          lastName: users.lastName,
          employeeId: users.employeeId,
          department: users.department,
          phone: users.phone,
          address: users.address,
          hireData: users.hireDate,
          isActive: users.isActive,
        }
      })
      .from(teacherAttendance)
      .leftJoin(users, eq(teacherAttendance.teacherId, users.id))
      .where(eq(teacherAttendance.id, id));

    result.map(attendance => ({
      ...attendance,
      checkIn: attendance.checkIn.getTime(),
    }));

    if(result[0]){
      return result[0]
    }
    
    return []
  }

    // Get student attendance by ID
  static async getStudentAttendanceById(id: string) {
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
  static async getStudentAttendanceByClass(
    classId: string,
    query: { date?: string } = {}
  ) {
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

    return result.map(attendance => ({
      ...attendance,
      date: new Date(attendance.date).getTime(),
    }));
  }

  // Get student attendance by student
  static async getStudentAttendanceByStudent(
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
        student: {
          id: students.id,
          schoolId: students.schoolId,
          firstName: students.firstName,
          lastName: students.lastName,
          email: students.email,
          phone: students.phone,
          address: students.address,
          dateOfBirth: students.dateOfBirth,
          gender: students.gender,
          isActive: students.isActive
        }
      })
      .from(studentAttendance)
      .leftJoin(classes, eq(studentAttendance.classId, classes.id))
      .leftJoin(users, eq(studentAttendance.markedBy, users.id))
      .leftJoin(students, eq(studentAttendance.studentId, students.id))
      .where(whereClause)
      .orderBy(desc(studentAttendance.date));

    return result;
  }

  // Get student attendance by date
  static async getStudentAttendanceByDate(
    date: string,
    query: { classId?: string } = {}
  ) {
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
  static async createStudentAttendance(attendanceData: NewStudentAttendance) {
    const result = await db
      .insert(studentAttendance)
      .values(attendanceData)
      .returning();
    return result[0];
  }

  // Create student attendance record in bulk
  static async createStudentAttendanceBulk(
    attendanceData: NewStudentAttendance[]
  ) {
    for (const attendance of attendanceData) {
      try {
        // Convert number timestamp to date string (YYYY-MM-DD format)
        const dateObj = new Date(attendance.date || Date.now());
        const dateString = dateObj.toISOString().split("T")[0];

        // The attendance.studentId is already the database ID, so we can use it directly
        // Just verify the student exists in the database
        const student = await db
          .select({ id: students.id })
          .from(students)
          .where(eq(students.id, attendance.studentId))
          .limit(1);

        if (student.length === 0) {
          console.error(
            `Student not found with database ID: ${attendance.studentId}`
          );
          continue;
        }

        const processedAttendance = {
          ...attendance,
          studentId: attendance.studentId, // Already the correct database ID
          date: dateString,
        } as NewStudentAttendance;

        await this.createStudentAttendance(processedAttendance);
      } catch (error) {
        console.error(
          `Error processing attendance for student ${attendance.studentId}:`,
          error
        );
      }
    }
  }

  // Update student attendance record
  static async updateStudentAttendance(
    id: string,
    updateData: Partial<NewStudentAttendance>
  ) {
    const result = await db
      .update(studentAttendance)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(studentAttendance.id, id))
      .returning();
    return result[0];
  }

  // Delete student attendance record
  static async deleteStudentAttendance(id: string) {
    await db.delete(studentAttendance).where(eq(studentAttendance.id, id));
  }

  // Get teacher attendance
  static async getTeacherAttendance(query: {
    page?: number;
    limit?: number;
    teacherId?: string;
  }) {
    const { page = 1, limit = 10, teacherId } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (teacherId) {
      whereConditions.push(eq(teacherAttendance.teacherId, teacherId));
    }

    const whereClause = and(...whereConditions);

    const [data, totalCount] = await Promise.all([
      db
        .select({
          id: teacherAttendance.id,
          teacherId: teacherAttendance.teacherId,
          latitude: teacherAttendance.latitude,
          longitude: teacherAttendance.longitude,
          checkIn: teacherAttendance.checkIn,
          status: teacherAttendance.status,
          notes: teacherAttendance.notes,
          createdAt: teacherAttendance.createdAt,
          updatedAt: teacherAttendance.updatedAt,
          teacher: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            employeeId: users.employeeId,
            department: users.department,
            schoolId: users.schoolId,
            phone: users.phone,
            address: users.address,
            hireDate: users.hireDate,
            isActive: users.isActive,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          },
        })
        .from(teacherAttendance)
        .leftJoin(users, eq(teacherAttendance.teacherId, users.id))
        .where(whereClause)
        .orderBy(asc(teacherAttendance.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: teacherAttendance.id })
        .from(teacherAttendance)
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

  // Create teacher attendance record
  static async createTeacherAttendance(attendanceData: NewTeacherAttendance) {
    const result = await db
      .insert(teacherAttendance)
      .values(attendanceData)
      .returning();
    return result[0];
  }

  // Get teacher attendance by ID
  static async getTeacherAttendanceByTeacherId(teacherId: string) {
    const result = await db
      .select()
      .from(teacherAttendance)
      .where(eq(teacherAttendance.teacherId, teacherId));
    return result.map(attendance => ({
      ...attendance,
      checkIn: attendance.checkIn.getTime(),
    }));
  }

  // Create teacher attendance record in bulk
  static async createTeacherAttendanceBulk(
    attendanceData: NewTeacherAttendance[]
  ) {
    for (const attendance of attendanceData) {
      // Convert number timestamp to Date object for checkIn
      const processedAttendance = {
        ...attendance,
        checkIn: new Date(attendance.checkIn || Date.now()),
      } as NewTeacherAttendance;
      await this.createTeacherAttendance(processedAttendance);
    }
  }
}
