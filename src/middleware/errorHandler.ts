import { Request, Response, NextFunction } from "express";

import {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
  AuthorizationError,
  AuthenticationError,
} from "@/types";
import logger from "@/utils/logger";

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Handle known application errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }
  // Handle validation errors
  else if (error.name === "ValidationError") {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  }
  // Handle JWT errors
  else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    isOperational = true;
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    isOperational = true;
  }
  // Handle MongoDB errors
  else if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
    isOperational = true;
  } else if (error.name === "MongoError" && (error as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
    isOperational = true;
  }
  // Handle file upload errors
  else if (error.name === "MulterError") {
    statusCode = 400;
    message = "File upload error";
    isOperational = true;
  }

  // Log error
  if (isOperational) {
    logger.warn(
      `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
  } else {
    logger.error(
      `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${error.stack}`
    );
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error utilities
export const createError = (
  message: string,
  statusCode: number = 500
): AppError => {
  return new AppError(message, statusCode);
};

export const createValidationError = (message: string): ValidationError => {
  return new ValidationError(message);
};

export const createAuthError = (
  message: string = "Authentication failed"
): AuthenticationError => {
  return new AuthenticationError(message);
};

export const createAuthzError = (
  message: string = "Access denied"
): AuthorizationError => {
  return new AuthorizationError(message);
};

export const createNotFoundError = (
  message: string = "Resource not found"
): NotFoundError => {
  return new NotFoundError(message);
};

export const createConflictError = (
  message: string = "Resource conflict"
): ConflictError => {
  return new ConflictError(message);
};
