import { Q } from "@nozbe/watermelondb";
import { Marks, Student } from "@/db/models";
import database from "@/db";
import { Marks as MarksType } from "@/types";

export class MarksService {
  // Get all marks for a specific class
  static async getSubjectMarks(subjectId: string): Promise<MarksType[]> {
    try {
      const marks = await database
        .get<Marks>("marks")
        .query(Q.where("subject_id", subjectId))
        .fetch();

      return marks.map(mark => ({
        id: mark.id,
        markId: mark.markId,
        subjectId: mark.subjectId,
        studentId: mark.studentId,
        marks: mark.marks,
        month: mark.month,
        createdAt: mark.createdAt,
        updatedAt: mark.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting class marks:", error);
      throw error;
    }
  }

  // Get marks for a specific student
  static async getStudentMarks(studentId: string): Promise<MarksType[]> {
    try {
      const marks = await database
        .get<Marks>("marks")
        .query(Q.where("student_id", studentId))
        .fetch();

      return marks.map(mark => ({
        id: mark.id,
        markId: mark.markId,
        subjectId: mark.subjectId,
        studentId: mark.studentId,
        marks: mark.marks,
        month: mark.month,
        createdAt: mark.createdAt,
        updatedAt: mark.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting student marks:", error);
      throw error;
    }
  }

  // Get marks for a specific subject and class with month filtering
  static async getSubjectMarksByClass(
    subjectId: string,
    classId: string,
    month?: string,
  ): Promise<MarksType[]> {
    try {
      const students = await database
        .get<Student>("students")
        .query(Q.where("class_id", classId))
        .fetch();

      if (students.length === 0) {
        return [];
      }

      const studentIds = students.map(student => student.studentId);

      let query = database
        .get<Marks>("marks")
        .query(
          Q.and(
            Q.where("student_id", Q.oneOf(studentIds)),
            Q.where("subject_id", subjectId),
          ),
        );

      if (month) {
        query = query.extend(Q.where("month", month));
      }

      const marks = await query.fetch();

      return marks.map(mark => ({
        id: mark.id,
        markId: mark.markId,
        subjectId: mark.subjectId,
        studentId: mark.studentId,
        marks: mark.marks,
        month: mark.month,
        createdAt: mark.createdAt,
        updatedAt: mark.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting subject marks by class:", error);
      throw error;
    }
  }

  // Get marks for a specific subject in a class
  static async getSubjectMarksInClass(
    classId: string,
    subjectId: string,
    _month?: string,
  ): Promise<MarksType[]> {
    try {
      const students = await database
        .get<Student>("students")
        .query(Q.where("class_id", classId))
        .fetch();

      if (students.length === 0) {
        return [];
      }

      const studentIds = students.map(student => student.studentId);

      const query = database
        .get<Marks>("marks")
        .query(
          Q.and(
            Q.where("student_id", Q.oneOf(studentIds)),
            Q.where("subject_id", subjectId),
          ),
        );

      // if (month) {
      //   query = query.query(Q.where("month", month));
      // }

      const marks = await query.fetch();

      return marks.map(mark => ({
        id: mark.id,
        markId: mark.markId,
        subjectId: mark.subjectId,
        studentId: mark.studentId,
        marks: mark.marks,
        month: mark.month,
        createdAt: mark.createdAt,
        updatedAt: mark.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting subject marks in class:", error);
      throw error;
    }
  }

  // Add marks for a student in a subject
  static async addMarks(marksData: {
    subjectId: string;
    studentId: string;
    marks: number;
    month: string;
  }): Promise<void> {
    try {
      await database.write(async () => {
        await database.get<Marks>("marks").create(mark => {
          mark.subjectId = marksData.subjectId;
          mark.studentId = marksData.studentId;
          mark.marks = marksData.marks;
          mark.month = marksData.month;
        });
      });
    } catch (error) {
      console.error("Error adding marks:", error);
      throw error;
    }
  }

  // Update existing marks
  static async updateMarks(
    markId: string,
    updateData: {
      marks?: number;
      month?: string;
    },
  ): Promise<void> {
    try {
      await database.write(async () => {
        const mark = await database.get<Marks>("marks").find(markId);
        await mark.update(updatedMark => {
          if (updateData.marks !== undefined) {
            updatedMark.marks = updateData.marks;
          }
          if (updateData.month !== undefined) {
            updatedMark.month = updateData.month;
          }
        });
      });
    } catch (error) {
      console.error("Error updating marks:", error);
      throw error;
    }
  }

  // Delete marks
  static async deleteMarks(markId: string): Promise<void> {
    try {
      await database.write(async () => {
        const mark = await database.get<Marks>("marks").find(markId);
        await mark.destroyPermanently();
      });
    } catch (error) {
      console.error("Error deleting marks:", error);
      throw error;
    }
  }

  // Get all available months for a class
  static async getAvailableMonths(classId: string): Promise<string[]> {
    try {
      const students = await database
        .get<Student>("students")
        .query(Q.where("class_id", classId))
        .fetch();

      if (students.length === 0) {
        return [];
      }

      const studentIds = students.map(student => student.studentId);

      const marks = await database
        .get<Marks>("marks")
        .query(Q.where("student_id", Q.oneOf(studentIds)))
        .fetch();

      const months = [...new Set(marks.map(mark => mark.month))];
      return months.sort();
    } catch (error) {
      console.error("Error getting available months:", error);
      throw error;
    }
  }
}
