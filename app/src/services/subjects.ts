import { Q } from "@nozbe/watermelondb";
import { Subject, TeacherAssignment, Class } from "@/db/models";
import database from "@/db";
import { Subject as SubjectType, Class as ClassType } from "@/types";

export interface SubjectWithClass {
  subject: SubjectType;
  class: ClassType;
  assignmentId: string;
}

export class SubjectsService {
  // Get all subjects
  static async getAllSubjects(): Promise<SubjectType[]> {
    try {
      const subjects = await database
        .get<Subject>("subjects")
        .query(Q.where("is_active", true))
        .fetch();

      return subjects.map(subject => ({
        id: subject.subjectId,
        name: subject.name,
        code: subject.code,
        description: subject.description || "",
        grade: subject.grade || "",
        isActive: subject.isActive,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting all subjects:", error);
      throw error;
    }
  }

  // Get subject by ID
  static async getSubjectById(subjectId: string): Promise<SubjectType | null> {
    try {
      const subject = await database
        .get<Subject>("subjects")
        .query(Q.where("subject_id", subjectId))
        .fetch();

      if (subject.length === 0) return null;

      const subjectData = subject[0];
      return {
        id: subjectData.subjectId,
        name: subjectData.name,
        code: subjectData.code,
        grade: subjectData.grade || "",
        description: subjectData.description || "",
        isActive: subjectData.isActive,
        createdAt: subjectData.createdAt,
        updatedAt: subjectData.updatedAt,
      };
    } catch (error) {
      console.error("Error getting subject by ID:", error);
      throw error;
    }
  }

  // Get subjects with class information for a specific teacher
  static async getSubjectsWithClassForTeacher(
    teacherId: string,
  ): Promise<SubjectWithClass[]> {
    try {
      // Get teacher assignments for the specific teacher
      const assignments = await database
        .get<TeacherAssignment>("teacher_assignments")
        .query(Q.where("teacher_id", teacherId), Q.where("is_active", true))
        .fetch();

      const subjectsWithClass: SubjectWithClass[] = [];

      for (const assignment of assignments) {
        try {
          // Get subject details
          const [subject] = await database
            .get<Subject>("subjects")
            .query(Q.where("subject_id", assignment.subjectId))
            .fetch();

          // Get class details
          const [classData] = await database
            .get<Class>("classes")
            .query(Q.where("class_id", assignment.classId))
            .fetch();

          if (subject && classData) {
            subjectsWithClass.push({
              subject: {
                id: subject.subjectId,
                name: subject.name,
                code: subject.code,
                description: subject.description || "",
                grade: subject.grade || "",
                isActive: subject.isActive,
                createdAt: subject.createdAt,
                updatedAt: subject.updatedAt,
              },
              class: {
                schoolId: classData.schoolId,
                classId: classData.classId,
                id: classData.classId,
                name: classData.name,
                grade: classData.grade,
                section: classData.section,
                academicYear: classData.academicYear,
                description: classData.description || "",
                isActive: classData.isActive,
                createdAt: classData.createdAt,
                updatedAt: classData.updatedAt,
              },
              assignmentId: assignment.id,
            });
          }
        } catch (error) {
          console.error(`Error processing assignment ${assignment.id}:`, error);
        }
      }

      return subjectsWithClass;
    } catch (error) {
      console.error("Error getting subjects with class for teacher:", error);
      throw error;
    }
  }

  // Get subjects with marks for a specific class
  static async getSubjectsWithMarks(classId: string): Promise<
    {
      subject: SubjectType;
      hasMarks: boolean;
      month?: string;
    }[]
  > {
    try {
      const subjects = await this.getAllSubjects();

      // Import MarksService dynamically to avoid circular dependencies
      const { MarksService } = await import("./marks");

      const subjectsWithMarks = await Promise.all(
        subjects.map(async subject => {
          try {
            const marks = await MarksService.getSubjectMarksInClass(
              classId,
              subject.id,
            );

            return {
              subject,
              hasMarks: marks.length > 0,
              month: marks.length > 0 ? marks[0].month : undefined,
            };
          } catch (error) {
            console.error(
              `Error getting marks for subject ${subject.id}:`,
              error,
            );
            return {
              subject,
              hasMarks: false,
            };
          }
        }),
      );

      return subjectsWithMarks;
    } catch (error) {
      console.error("Error getting subjects with marks:", error);
      throw error;
    }
  }
}
