import {Request, Response} from "express"
import { sendSuccess, sendBadRequest } from "@/utils/response";
import { SchoolService } from "@/services/schoolService";
import { asyncHandler } from "@/middleware/errorHandler";

export class SchoolController{
    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page, limit, search, schoolId } = req.query;
    
        const query: any = {};
        if (page) query.page = parseInt(page as string);
        if (limit) query.limit = parseInt(limit as string);
        if (search) query.search = search as string;
        if (schoolId) query.schoolId = schoolId as string;
    
        try {
          const result = await SchoolService.getBy(query);
          sendSuccess(res, result, "Schools retrieved successfully");
        } catch (error: any) {
          sendBadRequest(res, error.message || "Failed to retrieve schools");
        }
      });
}