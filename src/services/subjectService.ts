import { eq, and, like, asc } from "drizzle-orm";

import { db } from "@/db";
import { subjects } from "@/db/schema";
import type { NewSubject, Subject } from "@/db/schema";
import { NotFoundError, ConflictError } from "@/types";

export class SubjectService {
  // Get all subjects with pagination and search
  static async getAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 10, search, isActive } = query;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(like(subjects.name, `%${search}%`));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(subjects.isActive, isActive));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [data, totalCount] = await Promise.all([
      db
        .select()
        .from(subjects)
        .where(whereClause)
        .orderBy(asc(subjects.name))
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

  // Get subject by ID
  static async getById(id: string): Promise<Subject> {
    const result = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError("Subject not found");
    }

    return result[0]!;
  }

  // Get subject by code
  static async getByCode(code: string): Promise<Subject> {
    const result = await db
      .select()
      .from(subjects)
      .where(eq(subjects.code, code))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError("Subject not found");
    }

    return result[0]!;
  }

  // Create new subject
  static async create(
    data: Omit<NewSubject, "id" | "createdAt" | "updatedAt">
  ): Promise<Subject> {
    // Check if subject with same code already exists
    const existingSubject = await db
      .select()
      .from(subjects)
      .where(eq(subjects.code, data.code))
      .limit(1);

    if (existingSubject.length) {
      throw new ConflictError("Subject with this code already exists");
    }

    const result = await db.insert(subjects).values(data).returning();

    if (!result.length) {
      throw new Error("Failed to create subject");
    }

    return result[0]!;
  }

  // Update subject
  static async update(
    id: string,
    data: Partial<Omit<NewSubject, "id" | "createdAt" | "updatedAt">>
  ): Promise<Subject> {
    // Check if subject exists
    const existingSubject = await this.getById(id);

    // If code is being updated, check for conflicts
    if (data.code && data.code !== existingSubject.code) {
      const codeConflict = await db
        .select()
        .from(subjects)
        .where(eq(subjects.code, data.code))
        .limit(1);

      if (codeConflict.length) {
        throw new ConflictError("Subject with this code already exists");
      }
    }

    const result = await db
      .update(subjects)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subjects.id, id))
      .returning();

    if (!result.length) {
      throw new Error("Failed to update subject");
    }

    return result[0]!;
  }

  // Delete subject (soft delete by setting isActive to false)
  static async delete(id: string): Promise<void> {
    const existingSubject = await this.getById(id);

    await db
      .update(subjects)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(subjects.id, id));
  }

  // Hard delete subject
  static async hardDelete(id: string): Promise<void> {
    const existingSubject = await this.getById(id);

    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // Get active subjects only
  static async getActive(): Promise<Subject[]> {
    return db
      .select()
      .from(subjects)
      .where(eq(subjects.isActive, true))
      .orderBy(asc(subjects.name));
  }

  // Get subjects by department/field
  static async getByField(field: string): Promise<Subject[]> {
    return db
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.isActive, true),
          like(subjects.description, `%${field}%`)
        )
      )
      .orderBy(asc(subjects.name));
  }
}
