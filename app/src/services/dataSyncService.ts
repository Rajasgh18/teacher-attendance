import {
  attendanceApi,
  classesApi,
  studentsApi,
  subjectsApi,
  usersApi,
} from "../lib/api";
import { DatabaseService } from "./databaseService";

class DataSyncService {
  /**
   * Check if there's existing data for a different user
   */
  static async hasExistingDataForDifferentUser(currentUserId: string): Promise<{
    hasData: boolean;
    existingUserId?: string;
    existingUserName?: string;
  }> {
    try {
      // Check if there's any teacher data at all
      const teachers = await DatabaseService.getTeacherByUserId(currentUserId);

      if (teachers.length === 0) {
        // Check if there's any teacher data for other users
        const allTeachers = await DatabaseService.getAllTeachers();

        if (allTeachers.length > 0) {
          const otherTeacher = allTeachers[0];
          return {
            hasData: true,
            existingUserId: otherTeacher.id,
            existingUserName: `${otherTeacher.firstName} ${otherTeacher.lastName}`,
          };
        }
      }

      return { hasData: false };
    } catch (error) {
      console.error("Error checking existing data:", error);
      return { hasData: false };
    }
  }

  /**
   * Check if there's any existing data in the database
   */
  static async hasAnyExistingData(): Promise<boolean> {
    try {
      const [teachers, classes, students] = await Promise.all([
        DatabaseService.getAllTeachers(),
        DatabaseService.getAllClasses(),
        DatabaseService.getAllStudents(),
      ]);

      return teachers.length > 0 || classes.length > 0 || students.length > 0;
    } catch (error) {
      console.error("Error checking for existing data:", error);
      return false;
    }
  }

  /**
   * Clear all existing data
   */
  static async clearExistingData(): Promise<void> {
    try {
      await DatabaseService.clearAllData();
    } catch (error) {
      console.error("Error clearing existing data:", error);
      throw new Error("Failed to clear existing data");
    }
  }

  /**
   * Load teacher data from server
   */
  static async loadTeacherData(teacherId: string): Promise<void> {
    try {
      const [classes, subjects] = await Promise.all([
        usersApi.teacherClasses(),
        subjectsApi.list({
          limit: 100,
        }),
      ]);
      
      const studentsData = (
        await Promise.all(
          classes.map(cls =>
            studentsApi.byClassOrSchool({
              classId: cls.id,
              schoolId: cls.schoolId,
            }),
          ),
        )
      ).flat();

      await Promise.all([
        DatabaseService.createClasses(classes),
        DatabaseService.createStudents(studentsData),
        DatabaseService.syncSubjects(subjects.data),
      ]);

      await Promise.all([
        DatabaseService.updateSyncStatus("classes", Date.now()),
        DatabaseService.updateSyncStatus("students", Date.now()),
        DatabaseService.updateSyncStatus("subjects", Date.now()),
      ]);
    } catch (error) {
      console.error("Error loading teacher data:", error);
      throw new Error("Failed to load teacher data");
    }

    try {
      const [teacherAttendance, classes] = await Promise.all([
        attendanceApi.teacher.byTeacher(teacherId),
        DatabaseService.getAllClasses(),
      ]);

      const studentAttendanceData = (
        await Promise.all(
          classes.map(cls => attendanceApi.student.byClass(cls.classId)),
        )
      ).flat();

      await Promise.all([
        DatabaseService.syncTeacherAttendance(teacherAttendance),
        DatabaseService.syncStudentAttendance(studentAttendanceData),
      ]);

      await Promise.all([
        DatabaseService.updateSyncStatus("teacher_attendance", Date.now()),
        DatabaseService.updateSyncStatus("student_attendance", Date.now()),
      ]);
    } catch (error) {
      console.error("Error loading attendance data:", error);
      throw new Error("Failed to load attendance data");
    }

    try {
      const subjects = await usersApi.teacherSubjects(teacherId);
      await DatabaseService.syncSubjects(subjects);

      const marksResults = await Promise.allSettled(
        subjects.map(subject => subjectsApi.getMarks(subject.id)),
      );

      const allMarks = marksResults
        .filter(result => result.status === "fulfilled")
        .flatMap(result => (result as PromiseFulfilledResult<any[]>).value);

      if (allMarks.length > 0) {
        await DatabaseService.syncSubjectMarks(allMarks);
        await DatabaseService.updateSyncStatus("marks", Date.now());
      }

      marksResults
        .filter(result => result.status === "rejected")
        .forEach(result => {
          console.error(
            "Error loading subject marks data:",
            (result as PromiseRejectedResult).reason,
          );
        });
    } catch (error) {
      console.error("Error loading subject marks data:", error);
      throw new Error("Failed to load subject marks data");
    }
  }
  static async loadPrincipalData(schoolId: string): Promise<void> {
    try {
      const [classesData, studentsData, subjectsData, teachersData] =
        await Promise.all([
          classesApi.list({
            limit: 100,
            schoolId,
          }),
          studentsApi.list({
            schoolId,
          }),
          subjectsApi.list({
            limit: 100,
          }),
          usersApi.list({
            limit: 1000,
            schoolId,
          }),
        ]);

      await Promise.all([
        DatabaseService.syncSubjects(subjectsData.data),
        DatabaseService.createClasses(classesData.data),
        DatabaseService.createStudents(studentsData.data),
        DatabaseService.syncUsers(teachersData.data),
      ]);

      await Promise.all([
        DatabaseService.updateSyncStatus("classes", Date.now()),
        DatabaseService.updateSyncStatus("students", Date.now()),
        DatabaseService.updateSyncStatus("users", Date.now()),
        DatabaseService.updateSyncStatus("subjects", Date.now()),
      ]);
    } catch (error) {
      console.error("Error loading principal data:", error);
      throw new Error("Failed to load principal data");
    }
  }
}

export default DataSyncService;
