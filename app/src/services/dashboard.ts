import type {
  DashboardStats,
  TeacherDashboardData,
  ClassWithDetails,
  ClassSummary,
} from "@/types";

import { DatabaseService } from "./databaseService";
import StudentsService from "./students";

class DashboardService {
  /**
   * Get teacher dashboard stats from local database
   */
  static async getTeacherStats(teacherId: string): Promise<DashboardStats> {
    try {
      const stats = await DatabaseService.getTeacherStats(teacherId);

      return {
        totalClasses: stats.totalClasses,
        totalStudents: stats.totalStudents,
        totalTeachers: 1, // Just the current teacher
        totalSubjects: 0,
        todaySessions: 0,
        attendanceThisMonth: stats.attendanceThisMonth,
      };
    } catch (error) {
      console.error("Error getting teacher stats:", error);
      throw new Error("Failed to get teacher stats");
    }
  }

  /**
   * Get teacher dashboard data from local database
   */
  static async getTeacherDashboard(
    teacherId: string,
  ): Promise<TeacherDashboardData> {
    try {
      const [stats, classes] = await Promise.all([
        this.getTeacherStats(teacherId),
        DatabaseService.getTeacherClasses(),
      ]);

      const classesWithStudents: ClassWithDetails[] = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        classId: cls.classId,
        grade: cls.grade,
        section: cls.section,
        description: cls.description || "",
        academicYear: cls.academicYear,
        isActive: cls.isActive,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
        students: [], // Will be populated when needed
      }));

      for (const cls of classesWithStudents) {
        const students = await StudentsService.getStudentsByClass(cls.classId);
        cls.students = students;
      }

      return {
        stats,
        classes: classesWithStudents,
        assignments: [], // Will be populated when needed
      };
    } catch (error) {
      console.error("Error getting teacher dashboard:", error);
      throw new Error("Failed to get teacher dashboard");
    }
  }

  /**
   * Get teacher's classes with details from local database
   */
  static async getTeacherClasses(): Promise<ClassWithDetails[]> {
    try {
      const classes = await DatabaseService.getTeacherClasses();

      // Get students for each class
      const classesWithDetails = await Promise.all(
        classes.map(async cls => {
          const students = await DatabaseService.getClassStudents(cls.classId);
          const mappedStudents = students.map(student => ({
            id: student.id,
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phone,
            address: student.address,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            classId: student.class?.id || "",
            isActive: student.isActive,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
          }));
          return {
            id: cls.id,
            name: cls.name,
            classId: cls.classId,
            grade: cls.grade,
            section: cls.section,
            description: cls.description || "",
            academicYear: cls.academicYear,
            isActive: cls.isActive,
            createdAt: cls.createdAt,
            updatedAt: cls.updatedAt,
            students: mappedStudents,
          };
        }),
      );

      return classesWithDetails;
    } catch (error) {
      console.error("Error getting teacher classes with details:", error);
      throw new Error("Failed to get teacher classes with details");
    }
  }

  /**
   * Get class summary from local database
   */
  static async getClassSummary(classId: string) {
    try {
      const stats = await DatabaseService.getClassStats(classId);

      return {
        id: classId,
        name: "", // Would need to get from class data
        studentCount: stats.totalStudents,
        presentToday: stats.presentToday,
        absentToday: stats.absentToday,
        attendanceRate:
          stats.totalStudents > 0
            ? (stats.presentToday / stats.totalStudents) * 100
            : 0,
        color: "#3B82F6", // Default color
      };
    } catch (error) {
      console.error("Error getting class summary:", error);
      throw new Error("Failed to get class summary");
    }
  }

  /**
   * Get all class summaries for teacher from local database
   */
  static async getAllClassSummaries(): Promise<ClassSummary[]> {
    try {
      const classes = await DatabaseService.getTeacherClasses();
      const summaries = await Promise.all(
        classes.map(async cls => {
          const stats = await DatabaseService.getClassStats(cls.id);

          return {
            id: cls.id,
            name: cls.name,
            studentCount: stats.totalStudents,
            presentToday: stats.presentToday,
            absentToday: stats.absentToday,
            attendanceRate:
              stats.totalStudents > 0
                ? (stats.presentToday / stats.totalStudents) * 100
                : 0,
          };
        }),
      );
      return summaries;
    } catch (error) {
      console.error("Error getting all class summaries:", error);
      throw new Error("Failed to get all class summaries");
    }
  }

  /**
   * Generate color from string (for class colors)
   */
  private static generateColorFromString(str: string): string {
    const colors = [
      "#3B82F6", // Blue
      "#EF4444", // Red
      "#10B981", // Green
      "#F59E0B", // Yellow
      "#8B5CF6", // Purple
      "#F97316", // Orange
      "#06B6D4", // Cyan
      "#84CC16", // Lime
      "#EC4899", // Pink
      "#6366F1", // Indigo
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return colors[Math.abs(hash) % colors.length];
  }
}

export default DashboardService;
