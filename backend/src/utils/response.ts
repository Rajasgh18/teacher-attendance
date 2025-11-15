import { Response } from "express";
import { ApiResponse, PaginatedResponse, PaginationResult } from "@/types";

// Success response utility
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};

// Error response utility
export const sendError = (
  res: Response,
  message: string = "Internal Server Error",
  statusCode: number = 500,
  error?: string
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error && { error }),
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};

// Paginated response utility
export const sendPaginated = <T>(
  res: Response,
  result: PaginationResult<T>,
  message: string = "Success"
): void => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data: result.data,
    pagination: result.pagination,
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
};

// Created response utility
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = "Resource created successfully"
): void => {
  sendSuccess(res, data, message, 201);
};

// No content response utility
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

// Bad request response utility
export const sendBadRequest = (
  res: Response,
  message: string = "Bad Request",
  error?: string
): void => {
  sendError(res, message, 400, error);
};

// Unauthorized response utility
export const sendUnauthorized = (
  res: Response,
  message: string = "Unauthorized",
  error?: string
): void => {
  sendError(res, message, 401, error);
};

// Forbidden response utility
export const sendForbidden = (
  res: Response,
  message: string = "Forbidden",
  error?: string
): void => {
  sendError(res, message, 403, error);
};

// Not found response utility
export const sendNotFound = (
  res: Response,
  message: string = "Resource not found",
  error?: string
): void => {
  sendError(res, message, 404, error);
};

// Conflict response utility
export const sendConflict = (
  res: Response,
  message: string = "Resource conflict",
  error?: string
): void => {
  sendError(res, message, 409, error);
};

// Validation error response utility
export const sendValidationError = (
  res: Response,
  message: string = "Validation failed",
  errors?: string[]
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && errors.length > 0 && { error: errors.join(", ") }),
    timestamp: new Date().toISOString(),
  };

  res.status(422).json(response);
};

// Server error response utility
export const sendServerError = (
  res: Response,
  message: string = "Internal Server Error",
  error?: string
): void => {
  sendError(res, message, 500, error);
};

// Service unavailable response utility
export const sendServiceUnavailable = (
  res: Response,
  message: string = "Service Unavailable",
  error?: string
): void => {
  sendError(res, message, 503, error);
};

// Response utilities object
export const responseUtils = {
  success: sendSuccess,
  error: sendError,
  paginated: sendPaginated,
  created: sendCreated,
  noContent: sendNoContent,
  badRequest: sendBadRequest,
  unauthorized: sendUnauthorized,
  forbidden: sendForbidden,
  notFound: sendNotFound,
  conflict: sendConflict,
  validationError: sendValidationError,
  serverError: sendServerError,
  serviceUnavailable: sendServiceUnavailable,
};
