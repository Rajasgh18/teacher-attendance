import { db } from "@/db";
import { marks, NewMark, NewSubject, subjects } from "@/db/schema";
import { NotFoundError } from "@/types";
import { and, asc, eq, like } from "drizzle-orm";

export class SubjectService {
  static async getAllSubjects(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      classId?: string;
      schoolId?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, search, schoolId } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        and(
          like(subjects.name, `%${search}%`),
          like(subjects.code, `%${search}%`)
        )
      );
    }

    // if (schoolId !== undefined) {
    //   whereConditions.push(eq(subjects.schoolId, schoolId));
    // }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, totalCount] = await Promise.all([
      db
        .select()
        .from(subjects)
        .where(whereClause)
        .orderBy(asc(subjects.id))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: subjects.id })
        .from(subjects)
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

  static async createSubject(subject: NewSubject) {
    const result = await db.insert(subjects).values(subject);
    return result;
  }

  static async updateSubject(id: string, subject: NewSubject) {
    const subjectWithNewCode = await db
      .select()
      .from(subjects)
      .where(eq(subjects.code, subject.code));

    if (subjectWithNewCode.length !== 0) {
      throw new Error("A subject with the same subject code already exists");
    }

    const result = await db
      .update(subjects)
      .set(subject)
      .where(eq(subjects.id, id));
    return result;
  }

  static async deleteSubject(id: string) {
    const result = await db.delete(subjects).where(eq(subjects.id, id));
    return result;
  }

  static async getSubjectById(id: string) {
    const result = await db.select().from(subjects).where(eq(subjects.id, id));
    if (!result.length) {
      throw new NotFoundError("Subject not found");
    }

    return result[0]!;
  }

  static async getSubjectMarks(id: string) {
    const result = await db.select().from(marks).where(eq(marks.subjectId, id));
    return result;
  }

  static async addSubjectMarks(id: string, mark: NewMark) {
    const result = await db.insert(marks).values({
      ...mark,
      subjectId: id,
    });
    return result;
  }

  static async createSubjectMarksBulk(
    marksData: Array<{
      markId: string;
      subjectId: string;
      studentId: string;
      marks: number;
      month: string;
    }>
  ) {
    const results = [];

    for (const markData of marksData) {
      try {
        // Only try to update if markId is a valid UUID (not empty)
        if (markData.markId && markData.markId.trim() !== "") {
          // Check if mark already exists by markId
          const existingMark = await db
            .select()
            .from(marks)
            .where(eq(marks.id, markData.markId))
            .limit(1);

          if (existingMark.length > 0) {
            // Update existing mark
            const updatedMark = await db
              .update(marks)
              .set({
                marks: markData.marks.toString(), // Convert number to string for numeric field
                month: markData.month,
                updatedAt: new Date(),
              })
              .where(eq(marks.id, markData.markId))
              .returning();

            if (updatedMark[0]) {
              results.push({
                action: "updated",
                markId: markData.markId,
                data: updatedMark[0],
              });
            } else {
              throw new Error("Failed to update mark - no result returned");
            }
          } else {
            // MarkId exists but no record found - create new one
            const newMark = await db
              .insert(marks)
              .values({
                subjectId: markData.subjectId,
                studentId: markData.studentId,
                marks: markData.marks.toString(), // Convert number to string for numeric field
                month: markData.month,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning();

            if (newMark[0]) {
              results.push({
                action: "created",
                markId: newMark[0].id, // Use the generated id
                data: newMark[0],
              });
            } else {
              throw new Error("Failed to create mark - no result returned");
            }
          }
        } else {
          // No markId provided - always create new mark
          const newMark = await db
            .insert(marks)
            .values({
              subjectId: markData.subjectId,
              studentId: markData.studentId,
              marks: markData.marks.toString(), // Convert number to string for numeric field
              month: markData.month,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          if (newMark[0]) {
            results.push({
              action: "created",
              markId: newMark[0].id, // Use the generated id
              data: newMark[0],
            });
          } else {
            throw new Error("Failed to create mark - no result returned");
          }
        }
      } catch (error) {
        console.error(
          `Error processing mark ${markData.markId || "new"}:`,
          error
        );
        results.push({
          action: "error",
          markId: markData.markId || "new",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      totalProcessed: marksData.length,
      results,
      summary: {
        created: results.filter(r => r.action === "created").length,
        updated: results.filter(r => r.action === "updated").length,
        errors: results.filter(r => r.action === "error").length,
      },
    };
  }
}
