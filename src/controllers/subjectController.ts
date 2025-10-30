import { SubjectService } from "@/services/subjectService";
import { sendBadRequest, sendCreated, sendSuccess } from "@/utils/response";
import { Request, Response } from "express";

export class SubjectController {
  static getAllSubjects = async (req: Request, res: Response) => {
    const result = await SubjectService.getAllSubjects();
    sendSuccess(res, { data: result }, "Subjects retrieved successfully");
  };

  static createSubject = async (req: Request, res: Response) => {
    const result = await SubjectService.createSubject(req.body);
    sendCreated(res, result, "Subject created successfully");
  };

  static getSubjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    const result = await SubjectService.getSubjectById(id);
    sendSuccess(res, result, "Subject retrieved successfully");
  };

  static getSubjectMarks = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    const result = await SubjectService.getSubjectMarks(id);
    sendSuccess(res, result, "Subject marks retrieved successfully");
  };

  static addSubjectMarks = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    const result = await SubjectService.addSubjectMarks(id, req.body);
    sendCreated(res, result, "Subject marks added successfully");
  };

  static createSubjectMarksBulk = async (req: Request, res: Response) => {
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
    } catch (error) {
      console.error("Error in bulk marks creation:", error);
      sendBadRequest(res, "Failed to process marks data");
    }
  };

  static updateSubject = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    const result = await SubjectService.updateSubject(id, req.body);
    sendSuccess(res, result, "Subject updated successfully");
  };

  static deleteSubject = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }
    const result = await SubjectService.deleteSubject(id);
    sendSuccess(res, result, "Subject deleted successfully");
  };
}
