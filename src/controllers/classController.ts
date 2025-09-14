import { Request, Response } from "express";

import { ClassService } from "@/services/classService";
import { asyncHandler } from "@/middleware/errorHandler";
import { sendSuccess, sendCreated, sendBadRequest } from "@/utils/response";

export class ClassController {
  // Get all classes (accessible by teachers and admins)
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, grade, academicYear, isActive } = req.query;

    const query: any = {};
    if (page) query.page = parseInt(page as string);
    if (limit) query.limit = parseInt(limit as string);
    if (search) query.search = search as string;
    if (grade) query.grade = grade as string;
    if (academicYear) query.academicYear = academicYear as string;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const result = await ClassService.getAll(query);
    sendSuccess(res, result, "Classes retrieved successfully");
  });

  // Get class by ID (accessible by teachers and admins)
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Class ID is required");
      return;
    }

    const classData = await ClassService.getById(id);
    sendSuccess(res, classData, "Class retrieved successfully");
  });

  // Get class by name and grade (accessible by teachers and admins)
  static getByNameAndGrade = asyncHandler(
    async (req: Request, res: Response) => {
      const { name, grade } = req.params;

      if (!name || !grade) {
        sendBadRequest(res, "Class name and grade are required");
        return;
      }

      const classData = await ClassService.getByNameAndGrade(name, grade);
      sendSuccess(res, classData, "Class retrieved successfully");
    }
  );

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

    const classData = await ClassService.create({
      schoolId,
      name,
      grade,
      section,
      academicYear,
      isActive,
    });

    sendCreated(res, classData, "Class created successfully");
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

    const classData = await ClassService.update(id, updateData);
    sendSuccess(res, classData, "Class updated successfully");
  });

  // Delete class (soft delete - admin only)
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      sendBadRequest(res, "Class ID is required");
      return;
    }

    await ClassService.delete(id);
    sendSuccess(res, null, "Class deleted successfully");
  });

  // Get students in a class (accessible by teachers and admins)
  static getStudents = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;

    if (!classId) {
      sendBadRequest(res, "Class ID is required");
      return;
    }

    const students = await ClassService.getStudents(classId);
    sendSuccess(res, students, "Students retrieved successfully");
  });

  // Get class with teacher assignments (accessible by teachers and admins)
  static getWithTeachers = asyncHandler(async (req: Request, res: Response) => {
    const { classId } = req.params;

    if (!classId) {
      sendBadRequest(res, "Class ID is required");
      return;
    }

    const teachers = await ClassService.getWithTeachers(classId);
    sendSuccess(res, teachers, "Class teachers retrieved successfully");
  });

  // Get classes by grade (accessible by teachers and admins)
  static getByGrade = asyncHandler(async (req: Request, res: Response) => {
    const { grade } = req.params;

    if (!grade) {
      sendBadRequest(res, "Grade parameter is required");
      return;
    }

    const classes = await ClassService.getByGrade(grade);
    sendSuccess(res, classes, "Classes retrieved successfully");
  });

  // Get classes by academic year (accessible by teachers and admins)
  static getByAcademicYear = asyncHandler(
    async (req: Request, res: Response) => {
      const { academicYear } = req.params;

      if (!academicYear) {
        sendBadRequest(res, "Academic year parameter is required");
        return;
      }

      const classes = await ClassService.getByAcademicYear(academicYear);
      sendSuccess(res, classes, "Classes retrieved successfully");
    }
  );

  // Get active classes only (accessible by all authenticated users)
  static getActive = asyncHandler(async (req: Request, res: Response) => {
    const classes = await ClassService.getActive();
    sendSuccess(res, classes, "Active classes retrieved successfully");
  });
}
