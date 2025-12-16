import { Q } from "@nozbe/watermelondb";

import {
  User,
  Class,
  Student,
  SyncStatus,
  TeacherAssignment,
  TeacherAttendance,
  StudentAttendance,
} from "@/db/models";
import database from "@/db";
import {
  User as UserType,
  Class as ClassType,
  Marks as MarksType,
  Student as StudentType,
  Subject as SubjectType,
  TeacherAttendance as TeacherAttendanceType,
  StudentAttendance as StudentAttendanceType,
  TeacherAssignment as TeacherAssignmentType,
} from "@/types";
import Subject from "../db/models/Subject";
import Marks from "../db/models/Marks";
import { usersApi } from "../lib/api";

// Utility function to convert snake_case to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Utility function to convert object keys from snake_case to camelCase
function convertKeysToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    converted[camelKey] = convertKeysToCamelCase(value);
  }
  return converted;
}

// Helper function to extract raw data from WatermelonDB models and convert to camelCase
function extractRawData<T>(model: T): any {
  const rawData = (model as any)._raw;
  return convertKeysToCamelCase(rawData);
}

function extractRawDataArray<T>(models: T[]): any[] {
  return models.map(model => extractRawData(model));
}

export class DatabaseService {
  // User operations
  static async createUser(userData: {
    email: string;
    passwordHash: string;
    role: string;
    firstName: string;
    lastName: string;
    employeeId?: string;
    schoolId?: string;
    schoolName?: string;
    department?: string;
    phone?: string;
    address?: string;
    hireDate?: string;
    isActive: boolean;
  }): Promise<User> {
    return await database.write(async () => {
      return await database.get<User>("users").create(user => {
        user.email = userData.email;
        user.passwordHash = userData.passwordHash;
        user.role = userData.role;
        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.employeeId = userData.employeeId || null;
        user.schoolId = userData.schoolId || null;
        user.schoolName = userData.schoolName || null;
        user.department = userData.department || null;
        user.phone = userData.phone || null;
        user.address = userData.address || null;
        user.hireDate = userData.hireDate || null;
        user.isActive = userData.isActive;
      });
    });
  }

  static async getUserByEmail(email: string): Promise<User[]> {
    return await database
      .get<User>("users")
      .query(Q.where("email", email))
      .fetch();
  }

  static async getCurrentUser(userId: string): Promise<User | null> {
    try {
      return await database.get<User>("users").find(userId);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static async updateUser(userId: string, userData: any): Promise<void> {
    const user = await database.get<User>("users").find(userId);
    if (user) {
      await database.write(async () => {
        await user.update(updatedUser => {
          if (userData.email) updatedUser.email = userData.email;
          if (userData.role) updatedUser.role = userData.role;
          if (userData.schoolId) updatedUser.schoolId = userData.schoolId;
          if (userData.schoolName) updatedUser.schoolName = userData.schoolName;
          if (userData.isActive !== undefined)
            updatedUser.isActive = userData.isActive;
        });
      });
    }
  }

  // Store user data from API response
  static async storeUserFromApi(userData: any): Promise<void> {
    try {
      const existingUser = await database.get<User>("users").find(userData.id);
      if (existingUser) {
        await database.write(async () => {
          await existingUser.update(updatedUser => {
            updatedUser.email = userData.email || updatedUser.email;
            updatedUser.firstName = userData.firstName || updatedUser.firstName;
            updatedUser.lastName = userData.lastName || updatedUser.lastName;
            updatedUser.role = userData.role || updatedUser.role;
            updatedUser.employeeId =
              userData.employeeId || updatedUser.employeeId;
            updatedUser.schoolId = userData.schoolId || updatedUser.schoolId;
            updatedUser.schoolName =
              userData.school?.name || updatedUser.schoolName;
            updatedUser.department =
              userData.department || updatedUser.department;
            updatedUser.phone = userData.phone || updatedUser.phone;
            updatedUser.address = userData.address || updatedUser.address;
            updatedUser.hireDate = userData.hireDate || updatedUser.hireDate;
            updatedUser.isActive =
              userData.isActive !== undefined
                ? userData.isActive
                : updatedUser.isActive;
            updatedUser.updatedAt = Date.now();
          });
        });
      } else {
        await database.write(async () => {
          await database.get<User>("users").create(user => {
            user.email = userData.email || "";
            user.passwordHash = ""; // Not stored from API
            user.firstName = userData.firstName || "";
            user.lastName = userData.lastName || "";
            user.role = userData.role || "";
            user.employeeId = userData.employeeId || null;
            user.schoolId = userData.schoolId || null;
            user.schoolName = userData.school?.name || null;
            user.department = userData.department || null;
            user.phone = userData.phone || null;
            user.address = userData.address || null;
            user.hireDate = userData.hireDate || null;
            user.isActive =
              userData.isActive !== undefined ? userData.isActive : true;
            user.createdAt = userData.createdAt || Date.now();
            user.updatedAt = userData.updatedAt || Date.now();
          });
        });
      }
    } catch (error) {
      console.error("Error storing user from API:", error);
    }
  }

  static async syncUsers(usersData: UserType[]): Promise<void> {
    for (const user of usersData) {
      await this.createUser({
        email: user.email || "",
        passwordHash: "",
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName || "",
        employeeId: user.employeeId,
        schoolId: user.schoolId,
        schoolName: user.school?.name,
        department: user.department,
        phone: user.phone,
        address: user.address,
        hireDate: user.hireDate,
        isActive: user.isActive,
      });
    }
  }

  // Teacher operations (now using User model)
  static async getTeacherById(id: string): Promise<User | null> {
    try {
      const user = await database.get<User>("users").find(id);
      return user && user.role === "teacher" ? user : null;
    } catch (error) {
      console.error("Error getting teacher by ID:", error);
      return null;
    }
  }

  static async getTeacherByUserId(userId: string): Promise<User[]> {
    return await database
      .get<User>("users")
      .query(Q.where("id", userId), Q.where("role", "teacher"))
      .fetch();
  }

  static async getAllTeachers(): Promise<User[]> {
    const teachers = await database
      .get<User>("users")
      .query(Q.where("role", "teacher"), Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(teachers);
  }

  static async getTeacherAssignment(
    teacherId: string,
  ): Promise<TeacherAssignment[]> {
    return await database
      .get<TeacherAssignment>("teacher_assignments")
      .query(Q.where("teacher_id", teacherId), Q.where("is_active", true))
      .fetch();
  }

  static async getTeacherAssignmentBySubject(
    subjectId: string,
    teacherId?: string,
  ): Promise<TeacherAssignment | null> {
    try {
      const queryConditions = [
        Q.where("subject_id", subjectId),
        Q.where("is_active", true),
      ];

      if (teacherId) {
        queryConditions.push(Q.where("teacher_id", teacherId));
      }

      const [assignment] = await database
        .get<TeacherAssignment>("teacher_assignments")
        .query(...queryConditions)
        .fetch();

      return extractRawData(assignment) || null;
    } catch (error) {
      console.error("Error getting teacher assignment by subject:", error);
      return null;
    }
  }

  static async syncTeacherAssignments(
    teacherAssignmentData: TeacherAssignmentType[],
  ): Promise<void> {
    for (const assignment of teacherAssignmentData) {
      await this.createTeacherAssignment(
        assignment.teacherId,
        assignment.classId,
        assignment.subjectId,
        assignment.isPrimaryTeacher,
        assignment.isActive,
      );
    }
  }

  static async syncTeacherAttendance(
    teacherAttendanceData: TeacherAttendanceType[],
  ): Promise<void> {
    for (const attendance of teacherAttendanceData) {
      await this.markTeacherAttendance({
        teacherId: attendance.teacherId,
        latitude: attendance.latitude,
        longitude: attendance.longitude,
        checkIn: attendance.checkIn || Date.now(),
        status: attendance.status,
      });
    }
  }

  // Class operations
  static async createClass(classData: {
    classId: string;
    name: string;
    grade: string;
    section: string;
    academicYear: string;
    description: string;
    isActive: boolean;
  }): Promise<Class> {
    return await database.write(async () => {
      return await database.get<Class>("classes").create(cls => {
        cls.classId = classData.classId;
        cls.name = classData.name;
        cls.grade = classData.grade;
        cls.section = classData.section;
        cls.academicYear = classData.academicYear;
        cls.description = classData.description || null;
        cls.isActive = classData.isActive;
      });
    });
  }

  static async createClasses(classData: ClassType[]) {
    for (const cls of classData) {
      await this.createClass({
        classId: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        academicYear: cls.academicYear,
        description: cls.description,
        isActive: cls.isActive,
      });
    }
  }

  static async getTeacherClasses(): Promise<Class[]> {
    const classes = await database
      .get<Class>("classes")
      .query(Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(classes);
  }

  static async getAllClasses(): Promise<Class[]> {
    const classes = await database
      .get<Class>("classes")
      .query(Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(classes);
  }

  static async getClassById(id: string): Promise<Class | null> {
    try {
      const [classData] = await database
        .get<Class>("classes")
        .query(Q.where("class_id", id), Q.where("is_active", true))
        .fetch();

      return extractRawData(classData) || null;
    } catch (error) {
      console.error("Error getting class by ID:", error);
      return null;
    }
  }

  static async getClassByClassId(classId: string): Promise<Class | null> {
    try {
      const [classData] = await database
        .get<Class>("classes")
        .query(Q.where("class_id", classId), Q.where("is_active", true))
        .fetch();

      return extractRawData(classData) || null;
    } catch (error) {
      console.error("Error getting class by class ID:", error);
      return null;
    }
  }

  static async getClassStats(classId: string): Promise<{
    totalStudents: number;
    presentToday: number;
    absentToday: number;
  }> {
    try {
      const students = await this.getClassStudents(classId);

      // For now, return basic stats
      return {
        totalStudents: students.length,
        presentToday: 0, // Would need to implement attendance checking
        absentToday: 0, // Would need to implement attendance checking
      };
    } catch (error) {
      console.error("Error getting class stats:", error);
      return {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
      };
    }
  }

  // Student operations
  static async createStudent(studentData: {
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    gender: string;
    classId: string;
    isActive: boolean;
  }): Promise<Student> {
    return await database.write(async () => {
      return await database.get<Student>("students").create(student => {
        student.studentId = studentData.studentId;
        student.firstName = studentData.firstName;
        student.lastName = studentData.lastName;
        student.email = studentData.email;
        student.phone = studentData.phone;
        student.address = studentData.address;
        student.dateOfBirth = studentData.dateOfBirth;
        student.gender = studentData.gender;
        student.classId = studentData.classId;
        student.isActive = studentData.isActive;
      });
    });
  }

  static async createStudents(studentData: StudentType[]) {
    for (const student of studentData) {
      await this.createStudent({
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email || "",
        phone: student.phone || "",
        address: student.address || "",
        dateOfBirth: student.dateOfBirth || "",
        gender: student.gender || "",
        classId: student.classId,
        isActive: student.isActive,
      });
    }
  }

  static async getClassStudents(classId: string): Promise<Student[]> {
    const students = await database
      .get<Student>("students")
      .query(Q.where("class_id", classId), Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(students);
  }

  static async getAllStudents(): Promise<Student[]> {
    const students = await database
      .get<Student>("students")
      .query(Q.where("is_active", true))
      .fetch();
    return extractRawDataArray(students);
  }

  static async getStudentById(id: string): Promise<Student | null> {
    try {
      return await database.get<Student>("students").find(id);
    } catch (error) {
      console.error("Error getting student by ID:", error);
      return null;
    }
  }

  static async getStudentByStudentId(
    studentId: string,
  ): Promise<Student | null> {
    try {
      const [student] = await database
        .get<Student>("students")
        .query(Q.where("student_id", studentId))
        .fetch();
      return student || null;
    } catch (error) {
      console.error("Error getting student by ID:", error);
      return null;
    }
  }

  // TeacherClass operations
  static async createTeacherAssignment(
    teacherId: string,
    classId: string,
    subjectId: string,
    isPrimaryTeacher: boolean = false,
    isActive: boolean = true,
  ): Promise<TeacherAssignment> {
    return await database.write(async () => {
      return await database
        .get<TeacherAssignment>("teacher_assignments")
        .create(teacherClass => {
          teacherClass.teacherId = teacherId;
          teacherClass.classId = classId;
          teacherClass.subjectId = subjectId;
          teacherClass.isPrimaryTeacher = isPrimaryTeacher;
          teacherClass.isActive = isActive;
        });
    });
  }

  // Teacher Attendance operations
  static async markTeacherAttendance(attendanceData: {
    teacherId: string;
    latitude: number;
    longitude: number;
    checkIn: number;
    status: string;
  }): Promise<TeacherAttendance> {
    return await database.write(async () => {
      return await database
        .get<TeacherAttendance>("teacher_attendance")
        .create(attendance => {
          attendance.teacherId = attendanceData.teacherId;
          attendance.latitude = attendanceData.latitude;
          attendance.longitude = attendanceData.longitude;
          attendance.checkIn = attendanceData.checkIn || undefined;
          attendance.status = attendanceData.status;
        });
    });
  }

  static async getTeacherAttendance(
    teacherId: string,
    checkIn?: number,
  ): Promise<TeacherAttendance[]> {
    const query = [Q.where("teacher_id", teacherId)];
    if (checkIn) {
      // Convert checkIn to a date range for the same day
      const checkInDate = new Date(checkIn);
      const startOfDay = new Date(
        checkInDate.getFullYear(),
        checkInDate.getMonth(),
        checkInDate.getDate(),
      ).getTime();
      const endOfDay = new Date(
        checkInDate.getFullYear(),
        checkInDate.getMonth(),
        checkInDate.getDate(),
        23,
        59,
        59,
        999,
      ).getTime();

      query.push(Q.where("check_in", Q.gte(startOfDay)));
      query.push(Q.where("check_in", Q.lte(endOfDay)));
    }

    const attendance = await database
      .get<TeacherAttendance>("teacher_attendance")
      .query(...query)
      .fetch();
    return extractRawDataArray(attendance);
  }

  static async updateTeacherAttendance(
    id: string,
    updateData: {
      checkIn?: number;
      latitude?: number;
      longitude?: number;
      status?: string;
    },
  ): Promise<void> {
    const attendance = await database
      .get<TeacherAttendance>("teacher_attendance")
      .find(id);
    if (attendance) {
      await database.write(async () => {
        await attendance.update(updatedAttendance => {
          if (updateData.checkIn !== undefined)
            updatedAttendance.checkIn = updateData.checkIn;
          if (updateData.latitude !== undefined)
            updatedAttendance.latitude = updateData.latitude;
          if (updateData.longitude !== undefined)
            updatedAttendance.longitude = updateData.longitude;
          if (updateData.status !== undefined)
            updatedAttendance.status = updateData.status;
        });
      });
    }
  }

  // Student Attendance operations
  static async markStudentAttendance(attendanceData: {
    classId: string;
    studentId: string;
    date: number;
    status: string;
    notes?: string;
    markedBy?: string;
  }): Promise<StudentAttendance> {
    return await database.write(async () => {
      return await database
        .get<StudentAttendance>("student_attendance")
        .create(attendance => {
          attendance.classId = attendanceData.classId;
          attendance.studentId = attendanceData.studentId;
          attendance.date = attendanceData.date;
          attendance.status = attendanceData.status;
          attendance.notes = attendanceData.notes || null;
          attendance.markedBy = attendanceData.markedBy || "";
        });
    });
  }

  static async updateStudentAttendance(
    id: string,
    updateData: {
      status?: string;
      notes?: string;
      markedBy?: string;
    },
  ): Promise<void> {
    const attendance = await database
      .get<StudentAttendance>("student_attendance")
      .find(id);
    if (attendance) {
      await database.write(async () => {
        await attendance.update(updatedAttendance => {
          if (updateData.status !== undefined)
            updatedAttendance.status = updateData.status;
          if (updateData.notes !== undefined)
            updatedAttendance.notes = updateData.notes;
          if (updateData.markedBy !== undefined)
            updatedAttendance.markedBy = updateData.markedBy;
        });
      });
    }
  }

  static async getStudentAttendanceByClassAndDate(
    classId: string,
    date: number,
  ): Promise<StudentAttendance[]> {
    return await database
      .get<StudentAttendance>("student_attendance")
      .query(Q.where("class_id", classId), Q.where("date", date))
      .fetch();
  }

  static async getClassAttendance(
    classId: string,
    date?: number,
  ): Promise<StudentAttendance[]> {
    const query = [Q.where("class_id", classId)];
    if (date) {
      query.push(Q.where("date", Q.like(`%${date}%`)));
    }

    const studentAttendance = await database
      .get<StudentAttendance>("student_attendance")
      .query(...query)
      .fetch();
    return extractRawDataArray(studentAttendance);
  }

  static async getClassAttendanceModels(
    classId: string,
    date: string,
  ): Promise<StudentAttendance[]> {
    return await database
      .get<StudentAttendance>("student_attendance")
      .query(Q.where("class_id", classId), Q.where("date", date))
      .fetch();
  }

  static async getTodayAttendanceForClass(
    classId: string,
  ): Promise<StudentAttendance[]> {
    // Get today's date range (start of day to end of day)
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    ).getTime();

    const studentAttendance = await database
      .get<StudentAttendance>("student_attendance")
      .query(
        Q.where("class_id", classId),
        Q.where("date", Q.gte(startOfDay)),
        Q.where("date", Q.lte(endOfDay)),
      )
      .fetch();
    return extractRawDataArray(studentAttendance);
  }

  static async getTodayAttendanceForClassModels(
    classId: string,
  ): Promise<StudentAttendance[]> {
    const today = new Date().toISOString().split("T")[0];
    return await this.getClassAttendanceModels(classId, today);
  }

  static async getStudentAttendanceByDateRange(
    classId: string,
    startDate: number,
    endDate: number,
  ): Promise<StudentAttendance[]> {
    const startTimestamp = startDate;
    const endTimestamp = endDate;

    const studentAttendance = await database
      .get<StudentAttendance>("student_attendance")
      .query(
        Q.where("class_id", classId),
        Q.where("date", Q.gte(startTimestamp)),
        Q.where("date", Q.lte(endTimestamp)),
      )
      .fetch();
    return extractRawDataArray(studentAttendance);
  }

  static async getStudentAttendance(
    studentId: string,
  ): Promise<StudentAttendance[]> {
    return await database
      .get<StudentAttendance>("student_attendance")
      .query(Q.where("student_id", studentId))
      .fetch();
  }

  static async bulkCreateOrUpdateStudentAttendance(
    attendanceData: {
      studentId: string;
      classId: string;
      date: number;
      status: string;
      notes?: string;
      markedBy?: string;
    }[],
  ): Promise<void> {
    // Use the date from the first attendance record to find existing records
    const targetDate = attendanceData[0]?.date || Date.now();
    const todayStart = new Date(targetDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(targetDate);
    todayEnd.setHours(23, 59, 59, 999);

    // Get existing attendance records for the target date as model instances
    // Use date range query to find records for the same day
    const existingAttendance = await database
      .get<StudentAttendance>("student_attendance")
      .query(
        Q.where("class_id", attendanceData[0]?.classId || ""),
        Q.where("date", Q.gte(todayStart.getTime())),
        Q.where("date", Q.lte(todayEnd.getTime())),
      )
      .fetch();

    await database.write(async () => {
      for (const data of attendanceData) {
        // Check if attendance already exists for this student today
        const existingRecord = existingAttendance.find(
          record => record.studentId === data.studentId,
        );
        if (existingRecord) {
          // Update existing record directly
          await existingRecord.update(updatedAttendance => {
            updatedAttendance.status = data.status;
            updatedAttendance.notes = data.notes || null;
            updatedAttendance.markedBy = data.markedBy || "";
          });
        } else {
          // Create new record
          await database
            .get<StudentAttendance>("student_attendance")
            .create(attendance => {
              attendance.classId = data.classId;
              attendance.studentId = data.studentId;
              attendance.date = data.date;
              attendance.status = data.status;
              attendance.notes = data.notes || null;
              attendance.markedBy = data.markedBy || "";
            });
        }
      }
    });
  }

  // Subject operations
  static async createSubject(subject: {
    id: string;
    name: string;
    code: string;
    description: string;
    grade: string;
    isActive: boolean;
  }): Promise<void> {
    await database.write(async () => {
      await database.get<Subject>("subjects").create(sb => {
        sb.subjectId = subject.id;
        sb.name = subject.name;
        sb.code = subject.code;
        sb.description = subject.description;
        sb.isActive = subject.isActive;
        sb.grade = subject.grade;
      });
    });
  }

  static async getAllSubjects(): Promise<Subject[]> {
    return await database
      .get<Subject>("subjects")
      .query(Q.where("is_active", true))
      .fetch();
  }

  // Subject marks operations
  static async createSubjectMarks(subjectMark: {
    id: string;
    subjectId: string;
    studentId: string;
    marks: number;
    month: string;
  }): Promise<void> {
    await database.write(async () => {
      await database.get<Marks>("marks").create(sbMark => {
        sbMark.markId = subjectMark.id;
        sbMark.subjectId = subjectMark.subjectId;
        sbMark.studentId = subjectMark.studentId;
        sbMark.marks = subjectMark.marks;
        sbMark.month = subjectMark.month;
      });
    });
  }

  static async getAllMarks(): Promise<Marks[]> {
    return await database.get<Marks>("marks").query().fetch();
  }

  // Sync operations
  static async updateSyncStatus(
    tableName: string,
    lastSync: number,
  ): Promise<SyncStatus> {
    const existing = await database
      .get<SyncStatus>("sync_status")
      .query(Q.where("table_name", tableName))
      .fetch();

    return await database.write(async () => {
      if (existing.length > 0) {
        return await existing[0].update(sync => {
          sync.lastSync = lastSync;
        });
      } else {
        return await database.get<SyncStatus>("sync_status").create(sync => {
          sync.tableName = tableName;
          sync.lastSync = lastSync;
        });
      }
    });
  }

  static async getSyncStatus(tableName: string): Promise<SyncStatus | null> {
    const status = await database
      .get<SyncStatus>("sync_status")
      .query(Q.where("table_name", tableName))
      .fetch();

    return status.length > 0 ? status[0] : null;
  }

  static async getTeacherStats(): Promise<{
    totalClasses: number;
    totalStudents: number;
    attendanceThisMonth: number;
  }> {
    try {
      const classes = await this.getTeacherClasses();
      let totalStudents = 0;

      for (const cls of classes) {
        const students = await this.getClassStudents(cls.id);
        totalStudents += students.length;
      }

      return {
        totalClasses: classes.length,
        totalStudents,
        attendanceThisMonth: 0, // Would need to implement attendance calculation
      };
    } catch (error) {
      console.error("Error getting teacher stats:", error);
      return {
        totalClasses: 0,
        totalStudents: 0,
        attendanceThisMonth: 0,
      };
    }
  }

  static async getUnsyncedRecordsCount(): Promise<{
    teacherAttendance: number;
    studentAttendance: number;
  }> {
    // This would need to be implemented based on your sync tracking
    return {
      teacherAttendance: 0,
      studentAttendance: 0,
    };
  }

  static async syncStudentAttendance(
    studentAttendanceData: StudentAttendanceType[],
  ): Promise<void> {
    for (const attendance of studentAttendanceData) {
      await this.markStudentAttendance(attendance);
    }
  }

  static async syncSubjects(subjects: SubjectType[]): Promise<void> {
    for (const subject of subjects) {
      await this.createSubject({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        grade: subject.grade,
        description: subject.description,
        isActive: subject.isActive,
      });
    }
  }

  static async syncSubjectMarks(subjectMarks: MarksType[]): Promise<void> {
    for (const subjectMark of subjectMarks) {
      await this.createSubjectMarks({
        id: subjectMark.id,
        subjectId: subjectMark.subjectId,
        studentId: subjectMark.studentId,
        marks: Number(subjectMark.marks),
        month: subjectMark.month,
      });
    }
  }

  static async pushLiveLocation(
    latitude: number,
    longitude: number,
  ): Promise<void> {
    await usersApi.pushLiveLocation(latitude, longitude);
  }

  // Clear all data (for data sync)
  static async clearAllData(): Promise<void> {
    return await database.write(async () => {
      await database.get<User>("users").query().destroyAllPermanently();
      await database.get<Class>("classes").query().destroyAllPermanently();
      await database
        .get<TeacherAssignment>("teacher_assignments")
        .query()
        .destroyAllPermanently();
      await database.get<Student>("students").query().destroyAllPermanently();
      await database
        .get<TeacherAttendance>("teacher_attendance")
        .query()
        .destroyAllPermanently();
      await database
        .get<StudentAttendance>("student_attendance")
        .query()
        .destroyAllPermanently();
      await database.get<Subject>("subjects").query().destroyAllPermanently();
      await database.get<Marks>("marks").query().destroyAllPermanently();
      await database
        .get<SyncStatus>("sync_status")
        .query()
        .destroyAllPermanently();
    });
  }
}
