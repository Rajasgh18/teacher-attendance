import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";

import { ValidationError } from "@/types";

// Express-validator middleware
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ValidationError(errorMessages.join(", "));
  }

  next();
};

// Joi validation middleware
export const validateWithJoi = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      throw new ValidationError(errorMessages.join(", "));
    }

    req.body = value;
    next();
  };
};

// Common validation rules
export const commonValidations = {
  // User validations
  email: body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  password: body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  firstName: body("firstName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("First name must be between 2 and 100 characters"),

  lastName: body("lastName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Last name must be between 2 and 100 characters"),

  // Teacher validations
  employeeId: body("employeeId")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Employee ID must be between 3 and 20 characters"),

  department: body("department")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Department must be between 2 and 50 characters"),

  designation: body("designation")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Designation must be between 2 and 50 characters"),

  phoneNumber: body("phoneNumber")
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Please provide a valid phone number"),

  // Attendance validations
  date: body("date").isISO8601().withMessage("Please provide a valid date"),

  status: body("status")
    .isIn(["present", "absent", "late", "half_day", "leave"])
    .withMessage("Invalid attendance status"),

  // Pagination validations
  page: query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  limit: query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  // ID validations
  id: param("id").isUUID().withMessage("Invalid ID format"),

  teacherId: param("teacherId")
    .isUUID()
    .withMessage("Invalid teacher ID format"),
};

// Joi schemas
export const joiSchemas = {
  // User schemas
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .required(),
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    role: Joi.string()
      .valid("admin", "teacher", "principal")
      .default("teacher"),
  }),

  updateUser: Joi.object({
    email: Joi.string().email().optional(),
    firstName: Joi.string().min(2).max(100).optional(),
    lastName: Joi.string().min(2).max(100).optional(),
    role: Joi.string().valid("admin", "teacher", "principal").optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Teacher schemas
  createTeacher: Joi.object({
    userId: Joi.string().uuid().required(),
    employeeId: Joi.string().min(3).max(20).required(),
    department: Joi.string().min(2).max(50).required(),
    designation: Joi.string().min(2).max(50).required(),
    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .required(),
    address: Joi.string().min(10).max(200).required(),
    joiningDate: Joi.date().iso().required(),
  }),

  updateTeacher: Joi.object({
    employeeId: Joi.string().min(3).max(20).optional(),
    department: Joi.string().min(2).max(50).optional(),
    designation: Joi.string().min(2).max(50).optional(),
    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .optional(),
    address: Joi.string().min(10).max(200).optional(),
    joiningDate: Joi.date().iso().optional(),
    isActive: Joi.boolean().optional(),
  }),

  // Attendance schemas
  createAttendance: Joi.object({
    teacherId: Joi.string().uuid().required(),
    date: Joi.date().iso().required(),
    checkInTime: Joi.date().iso().optional(),
    checkOutTime: Joi.date().iso().optional(),
    status: Joi.string()
      .valid("present", "absent", "late", "half_day", "leave")
      .required(),
    notes: Joi.string().max(500).optional(),
  }),

  updateAttendance: Joi.object({
    checkInTime: Joi.date().iso().optional(),
    checkOutTime: Joi.date().iso().optional(),
    status: Joi.string()
      .valid("present", "absent", "late", "half_day", "leave")
      .optional(),
    notes: Joi.string().max(500).optional(),
  }),

  // Search schemas
  searchQuery: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string()
      .valid("name", "email", "createdAt", "updatedAt")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    filters: Joi.object().optional(),
  }),

  // Date range schema
  dateRange: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
  }),

  // Auth schemas
  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .required(),
  }),
};

// Validation middleware factory
export const createValidationMiddleware = (validations: any[]) => {
  return [...validations, validate];
};

// Export commonly used validation combinations
export const userValidations = {
  create: createValidationMiddleware([
    commonValidations.email,
    commonValidations.password,
    commonValidations.firstName,
    commonValidations.lastName,
  ]),

  update: createValidationMiddleware([
    commonValidations.email.optional(),
    commonValidations.firstName.optional(),
    commonValidations.lastName.optional(),
  ]),

  login: createValidationMiddleware([
    commonValidations.email,
    body("password").notEmpty().withMessage("Password is required"),
  ]),

  email: createValidationMiddleware([commonValidations.email]),
};

export const teacherValidations = {
  create: createValidationMiddleware([
    commonValidations.employeeId,
    commonValidations.department,
    commonValidations.designation,
    commonValidations.phoneNumber,
    body("address")
      .isLength({ min: 10, max: 200 })
      .withMessage("Address must be between 10 and 200 characters"),
    body("joiningDate")
      .isISO8601()
      .withMessage("Please provide a valid joining date"),
  ]),

  update: createValidationMiddleware([
    commonValidations.employeeId.optional(),
    commonValidations.department.optional(),
    commonValidations.designation.optional(),
    commonValidations.phoneNumber.optional(),
    body("address").isLength({ min: 10, max: 200 }).optional(),
    body("joiningDate").isISO8601().optional(),
  ]),
};

export const attendanceValidations = {
  create: createValidationMiddleware([
    commonValidations.date,
    commonValidations.status,
    body("notes").isLength({ max: 500 }).optional(),
  ]),

  update: createValidationMiddleware([
    commonValidations.status.optional(),
    body("notes").isLength({ max: 500 }).optional(),
  ]),
};
