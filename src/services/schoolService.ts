import { db } from "@/db";
import { schools } from "@/db/schema";
import { and, asc, eq, like } from "drizzle-orm";

export class SchoolService{
    static async getBy(
        query: {
          page?: number;
          limit?: number;
          search?: string;
          schoolId?: string;
        } = {}
      ) {
        const { page = 1, limit = 10, search, schoolId } = query;
        const offset = (page - 1) * limit;
    
        let whereConditions = [];
    
        if (search) {
          whereConditions.push(
            and(
              like(schools.name, `%${search}%`),
              like(schools.id, `%${search}%`)
            )
          );
        }
    
        if (schoolId !== undefined) {
          whereConditions.push(eq(schools.id, schoolId));
        }
    
        const whereClause =
          whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
        const [data, totalCount] = await Promise.all([
          db
            .select({
              id: schools.id,
              name: schools.name
            })
            .from(schools)
            .where(whereClause)
            .orderBy(asc(schools.id))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: schools.id })
            .from(schools)
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
}