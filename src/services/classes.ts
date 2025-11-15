import { DatabaseService } from "./databaseService";

import type { Class, ClassWithDetails, ClassStats, Student } from "@/types";

class ClassesService {
  /**
   * Get teacher's classes from local database
   */
  static async getClasses(): Promise<Class[]> {
    try {
      const classes = await DatabaseService.getTeacherClasses();
      return classes.map(cls => ({
        id: cls.id,
        classId: cls.classId,
        schoolId: cls.schoolId,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        description: cls.description || "",
        academicYear: cls.academicYear,
        isActive: cls.isActive,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting teacher classes:", error);
      throw new Error("Failed to get teacher classes");
    }
  }

  /**
   * Get class by ID from local database
   */
  static async getClassById(id: string): Promise<Class | null> {
    try {
      const cls = await DatabaseService.getClassById(id);
      if (!cls) return null;

      return {
        id: cls.id,
        classId: cls.classId,
        schoolId: cls.schoolId,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        description: cls.description || "",
        academicYear: cls.academicYear,
        isActive: cls.isActive,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
      };
    } catch (error) {
      console.error("Error getting class by ID:", error);
      throw new Error("Failed to get class by ID");
    }
  }

  /**
   * Search classes from local database
   */
  static async searchClasses(
    query: string,
    teacherId?: string,
  ): Promise<Class[]> {
    try {
      // For now, return all classes for the teacher
      // This can be enhanced with proper search functionality
      const classes = teacherId
        ? await DatabaseService.getTeacherClasses()
        : await DatabaseService.getAllClasses();

      return classes
        .filter(cls => cls.name.toLowerCase().includes(query.toLowerCase()))
        .map(cls => ({
          id: cls.id,
          classId: cls.classId,
          schoolId: cls.schoolId,
          name: cls.name,
          grade: cls.grade,
          section: cls.section,
          description: cls.description || "",
          academicYear: cls.academicYear,
          isActive: cls.isActive,
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt,
        }));
    } catch (error) {
      console.error("Error searching classes:", error);
      throw new Error("Failed to search classes");
    }
  }

  /**
   * Get class students from local database
   */
  static async getClassStudents(classId: string): Promise<Student[]> {
    try {
      const students = await DatabaseService.getClassStudents(classId);
      return students.map(student => ({
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
    } catch (error) {
      console.error("Error getting class students:", error);
      throw new Error("Failed to get class students");
    }
  }

  /**
   * Get class statistics from local database
   */
  static async getClassStats(classId: string): Promise<ClassStats> {
    try {
      const students = await DatabaseService.getClassStudents(classId);
      return {
        studentCount: students.length,
        teacherCount: 1, // Each class has one teacher
      };
    } catch (error) {
      console.error("Error getting class stats:", error);
      throw new Error("Failed to get class stats");
    }
  }

  /**
   * Get class with details from local database
   */
  static async getClassWithDetails(id: string): Promise<ClassWithDetails> {
    try {
      const classData = await this.getClassById(id);
      if (!classData) {
        throw new Error("Class not found");
      }

      const students = await this.getClassStudents(id);

      return {
        ...classData,
        students,
      };
    } catch (error) {
      console.error("Error getting class with details:", error);
      throw new Error("Failed to get class with details");
    }
  }
}

export default ClassesService;
