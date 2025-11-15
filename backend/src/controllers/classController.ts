import { Request, Response } from "express";

import { ClassService } from "@/services/classService";
import { sendSuccess, sendCreated, sendBadRequest, sendNotFound } from "@/utils/response";
import { asyncHandler } from "@/middleware/errorHandler";

export class ClassController {
  // Get all classes (accessible by teachers and admins)
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, schoolId } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (schoolId) query.schoolId = schoolId as string;

    try {
      const result = await ClassService.getBy(query);
      sendSuccess(res, result, "Classes retrieved successfully");
    } catch (error: any) {
      sendBadRequest(res, error.message || "Failed to retrieve classes");
    }
  });

  // Get class by ID (accessible by teachers and admins)
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Class ID is required");
      return;
    }

    try {
      const classData = await ClassService.getById(id);
      sendSuccess(res, classData, "Class retrieved successfully");
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message || "Failed to retrieve class");
      }
    }
  });

  // Create new class (admin only)
  static create = asyncHandler(async (req: Request, res: Response) => {
    const {
      schoolId,
      name,
      grade,
      section,
      academicYear,
      isActive = true,
    } = req.body;

    if (!schoolId) {
      sendBadRequest(res, "School ID is required");
      return;
    }

    if (!name || !grade || !academicYear) {
      sendBadRequest(res, "Name, grade, and academic year are required");
      return;
    }

    if (name.length > 100) {
      sendBadRequest(res, "Name must be 100 characters or less");
      return;
    }

    if (grade.length > 20) {
      sendBadRequest(res, "Grade must be 20 characters or less");
      return;
    }

    if (section && section.length > 10) {
      sendBadRequest(res, "Section must be 10 characters or less");
      return;
    }

    try {
      const classData = await ClassService.create({
        schoolId,
        name,
        grade,
        section,
        academicYear,
        isActive,
      });
      sendCreated(res, classData, "Class created successfully");
    } catch (error: any) {
      sendBadRequest(res, error.message || "Failed to create class");
    }
  });

  // Update class (admin only)
  static update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, grade, section, academicYear, isActive } = req.body;

    if (!id) {
      sendBadRequest(res, "Class ID is required");
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

    if (grade !== undefined) {
      if (grade.length > 20) {
        sendBadRequest(res, "Grade must be 20 characters or less");
        return;
      }
      updateData.grade = grade;
    }

    if (section !== undefined) {
      if (section.length > 10) {
        sendBadRequest(res, "Section must be 10 characters or less");
        return;
      }
      updateData.section = section;
    }

    if (academicYear !== undefined) {
      updateData.academicYear = academicYear;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    try {
      const classData = await ClassService.update(id, updateData);
      sendSuccess(res, classData, "Class updated successfully");
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message || "Failed to update class");
      }
    }
  });

  // Delete class (soft delete - admin only)
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Class ID is required");
      return;
    }

    try {
      await ClassService.delete(id);
      sendSuccess(res, null, "Class deleted successfully");
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        sendNotFound(res, error.message);
      } else {
        sendBadRequest(res, error.message || "Failed to delete class");
      }
    }
  });

  // Get students in a class (accessible by teachers and admins)
  static getStudents = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query;

    try {
      const students = await ClassService.getStudents(query);
      sendSuccess(res, students, "Students retrieved successfully");
    } catch (error: any) {
      sendBadRequest(res, error.message || "Failed to retrieve students");
    }
  });

  // Get class with teacher assignments (accessible by teachers and admins)
  static getTeachers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query;

    try {
      const teachers = await ClassService.getTeachers(query);
      sendSuccess(res, teachers, "Class teachers retrieved successfully");
    } catch (error: any) {
      sendBadRequest(res, error.message || "Failed to retrieve teachers");
    }
  });
}
