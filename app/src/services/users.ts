import { DatabaseService } from "./databaseService";
import type {
  User,
  Teacher,
  UpdateUserRequest,
  UpdateTeacherRequest,
  TeacherAssignment,
} from "@/types";

class UsersService {
  /**
   * Get current user from local database
   */
  static async getCurrentUser(userId: string): Promise<User | null> {
    try {
      const user = await DatabaseService.getCurrentUser(userId);
      if (!user) return null;

      // Convert database type to API type
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any, // Convert to UserRole enum
        employeeId: user.employeeId || "",
        schoolId: user.schoolId || "",
        school:
          user.schoolId && user.schoolName
            ? {
                id: user.schoolId,
                name: user.schoolName,
              }
            : undefined,
        department: user.department || "",
        phone: user.phone || "",
        address: user.address || "",
        hireDate: user.hireDate || "",
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      throw new Error("Failed to get current user");
    }
  }

  /**
   * Update current user in local database
   */
  static async updateCurrentUser(
    userId: string,
    userData: UpdateUserRequest,
  ): Promise<void> {
    try {
      await DatabaseService.updateUser(userId, userData);
    } catch (error) {
      console.error("Error updating current user:", error);
      throw new Error("Failed to update current user");
    }
  }

  /**
   * Get teacher profile from local database
   */
  static async getTeacherProfile(userId: string): Promise<Teacher | null> {
    try {
      const user = await DatabaseService.getCurrentUser(userId);
      if (!user || user.role !== "teacher") {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as any, // Convert to UserRole enum
        employeeId: user.employeeId || "",
        schoolId: user.schoolId || "",
        school:
          user.schoolId && user.schoolName
            ? {
                id: user.schoolId,
                name: user.schoolName,
              }
            : undefined,
        department: user.department || "",
        phone: user.phone || "",
        address: user.address || "",
        hireDate: user.hireDate || "",
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error getting teacher profile:", error);
      throw new Error("Failed to get teacher profile");
    }
  }

  /**
   * Update teacher profile in local database
   */
  static async updateTeacherProfile(
    userId: string,
    teacherData: UpdateTeacherRequest,
  ): Promise<void> {
    try {
      await DatabaseService.updateUser(userId, teacherData);
    } catch (error) {
      console.error("Error updating teacher profile:", error);
      throw new Error("Failed to update teacher profile");
    }
  }

  /**
   * Get teacher assignments from local database
   */
  static async getTeacherAssignments(
    teacherId: string,
  ): Promise<TeacherAssignment[]> {
    try {
      const assignments = await DatabaseService.getTeacherAssignment(teacherId);
      return assignments.map(assignment => ({
        id: assignment.id,
        classId: assignment.classId,
        subjectId: assignment.subjectId,
        teacherId: assignment.teacherId,
        isPrimaryTeacher: assignment.isPrimaryTeacher,
        isActive: assignment.isActive,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting teacher assignments:", error);
      throw new Error("Failed to get teacher assignments");
    }
  }

  /**
   * Get live location from local database
   */
  static async pushLiveLocation(
    latitude: number,
    longitude: number,
  ): Promise<void> {
    try {
      await DatabaseService.pushLiveLocation(latitude, longitude);
    } catch (error) {
      console.error("Error pushing live location:", error);
      throw new Error("Failed to push live location");
    }
  }
}

export default UsersService;
