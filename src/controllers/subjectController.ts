import { SubjectService } from "@/services/subjectService";
import { sendBadRequest, sendCreated, sendSuccess, sendNotFound } from "@/utils/response";
import { Request, Response } from "express";
import { asyncHandler } from "@/middleware/errorHandler";

export class SubjectController {
  static getAllSubjects = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, schoolId } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (schoolId) query.schoolId = schoolId as string;

    try {
      const result = await SubjectService.getAllSubjects(query);
      sendSuccess(res, result, "Subjects retrieved successfully");
    } catch (error: any) {
      sendBadRequest(res, error.message || "Failed to retrieve subjects");
    }
  });

  static createSubject = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await SubjectService.createSubject(req.body);
      sendCreated(res, result, "Subject created successfully");
    } catch (error: any) {
      sendBadRequest(res, error.message || "Failed to create subject");
    }
  });

  static getSubjectById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    try {
      const result = await SubjectService.getSubjectById(id);
      sendSuccess(res, result, "Subject retrieved successfully");
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message || "Failed to retrieve subject");
      }
    }
  });

  static getSubjectMarks = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    try {
      const result = await SubjectService.getSubjectMarks(id);
      sendSuccess(res, result, "Subject marks retrieved successfully");
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message || "Failed to retrieve subject marks");
      }
    }
  });

  static addSubjectMarks = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    try {
      const result = await SubjectService.addSubjectMarks(id, req.body);
      sendCreated(res, result, "Subject marks added successfully");
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message || "Failed to add subject marks");
      }
    }
  });

  static createSubjectMarksBulk = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { marksData } = req.body;

      if (!marksData || !Array.isArray(marksData) || marksData.length === 0) {
        sendBadRequest(res, "Marks data array is required");
        return;
      }

      const result = await SubjectService.createSubjectMarksBulk(marksData);

      if (result.summary.errors > 0) {
        // Send success with warnings if there are some errors
        sendSuccess(
          res,
          result,
          `Processed ${result.totalProcessed} marks with ${result.summary.errors} errors`
        );
      } else {
        sendCreated(
          res,
          result,
          `Successfully processed ${result.totalProcessed} marks`
        );
      }
    } catch (error: any) {
      sendBadRequest(res, error.message || "Failed to process marks data");
    }
  });

  static updateSubject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }

    try {
      const result = await SubjectService.updateSubject(id, req.body);
      sendSuccess(res, result, "Subject updated successfully");
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message || "Failed to update subject");
      }
    }
  });

  static deleteSubject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    try {
      const result = await SubjectService.deleteSubject(id);
      sendSuccess(res, result, "Subject deleted successfully");
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message || "Failed to delete subject");
      }
    }
  });
}
