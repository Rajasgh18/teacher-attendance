import type { Student } from "@/types";

import { DatabaseService } from "./databaseService";

class StudentsService {
  /**
   * Get students by class from local database
   */
  static async getStudentsByClass(classId: string): Promise<Student[]> {
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
      console.error("Error getting students by class:", error);
      throw new Error("Failed to get students by class");
    }
  }

  /**
   * Get student by ID from local database
   */
  static async getStudentById(id: string): Promise<Student | null> {
    try {
      const student = await DatabaseService.getStudentById(id);
      if (!student) return null;

      return {
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
      };
    } catch (error) {
      console.error("Error getting student by ID:", error);
      throw new Error("Failed to get student by ID");
    }
  }
  static async getAllStudents(): Promise<Student[]> {
    try {
      const students = await DatabaseService.getAllStudents();
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
      console.error("Error getting all students:", error);
      throw new Error("Failed to get all students");
    }
  }
  static async getStudentByStudentId(
    studentId: string,
  ): Promise<Student | null> {
    try {
      const student = await DatabaseService.getStudentByStudentId(studentId);
      if (!student) return null;

      return {
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
      };
    } catch (error) {
      console.error("Error getting student by ID:", error);
      throw new Error("Failed to get student by ID");
    }
  }

  /**
   * Search students from local database
   */
  static async searchStudents(
    query: string,
    _classId?: string,
  ): Promise<Student[]> {
    try {
      // For now, get all students and filter by query
      const allStudents = await DatabaseService.getAllStudents();
      return allStudents
        .filter(
          student =>
            student.firstName.toLowerCase().includes(query.toLowerCase()) ||
            student.lastName.toLowerCase().includes(query.toLowerCase()) ||
            student.studentId.toLowerCase().includes(query.toLowerCase()),
        )
        .map(student => ({
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
      console.error("Error searching students:", error);
      throw new Error("Failed to search students");
    }
  }

  /**
   * Get student attendance from local database
   */
  static async getStudentAttendance(studentId: string): Promise<any[]> {
    try {
      const studentAttendance = await DatabaseService.getStudentAttendance(
        studentId,
      );
      return studentAttendance;
    } catch (error) {
      console.error("Error getting student attendance:", error);
      throw new Error("Failed to get student attendance");
    }
  }
}

export default StudentsService;
