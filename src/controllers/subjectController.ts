import { Request, Response } from "express";

import { asyncHandler } from "@/middleware/errorHandler";
import { SubjectService } from "@/services/subjectService";
import { sendSuccess, sendCreated, sendBadRequest } from "@/utils/response";

export class SubjectController {
  // Get all subjects (accessible by all authenticated users)
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, isActive } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const result = await SubjectService.getAll(query);

    sendSuccess(res, result, "Subjects retrieved successfully");
  });

  // Get subject by ID (accessible by all authenticated users)
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }

    const subject = await SubjectService.getById(id);
    sendSuccess(res, subject, "Subject retrieved successfully");
  });

  // Get subject by code (accessible by all authenticated users)
  static getByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;

    if (!code) {
      sendBadRequest(res, "Subject code is required");
      return;
    }

    const subject = await SubjectService.getByCode(code);
    sendSuccess(res, subject, "Subject retrieved successfully");
  });

  // Create new subject (admin and principal only)
  static create = asyncHandler(async (req: Request, res: Response) => {
    const { name, code, description, isActive = true } = req.body;

    if (!name || !code) {
      sendBadRequest(res, "Name and code are required");
      return;
    }

    if (code.length > 20) {
      sendBadRequest(res, "Code must be 20 characters or less");
      return;
    }

    if (name.length > 100) {
      sendBadRequest(res, "Name must be 100 characters or less");
      return;
    }

    const subject = await SubjectService.create({
      name,
      code: code.toUpperCase(),
      description,
      isActive,
    });

    sendCreated(res, subject, "Subject created successfully");
  });

  // Update subject (admin and principal only)
  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }

    const updateData: any = {};
    if (name !== undefined) {
      if (name.length > 100) {
        sendBadRequest(res, "Name must be 100 characters or less");
        return;
      }
      updateData.name = name;
    }

    if (code !== undefined) {
      if (code.length > 20) {
        sendBadRequest(res, "Code must be 20 characters or less");
        return;
      }
      updateData.code = code.toUpperCase();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const subject = await SubjectService.update(id, updateData);
    sendSuccess(res, subject, "Subject updated successfully");
  });

  // Delete subject (soft delete - admin and principal only)
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }

    await SubjectService.delete(id);
    sendSuccess(res, null, "Subject deleted successfully");
  });

  // Hard delete subject (admin only)
  static hardDelete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Subject ID is required");
      return;
    }

    await SubjectService.hardDelete(id);
    sendSuccess(res, null, "Subject permanently deleted");
  });

  // Get active subjects only (accessible by all authenticated users)
  static getActive = asyncHandler(async (req: Request, res: Response) => {
    const subjects = await SubjectService.getActive();
    sendSuccess(res, subjects, "Active subjects retrieved successfully");
  });

  // Get subjects by field (accessible by all authenticated users)
  static getByField = asyncHandler(async (req: Request, res: Response) => {
    const { field } = req.params;

    if (!field) {
      sendBadRequest(res, "Field parameter is required");
      return;
    }

    const subjects = await SubjectService.getByField(field);
    sendSuccess(res, subjects, "Subjects retrieved successfully");
  });
}
