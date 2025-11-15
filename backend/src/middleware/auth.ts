import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import {
  UserRole,
  JwtPayload,
  AuthorizationError,
  AuthenticationError,
} from "@/types";
import { config } from "@/config";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Type for authenticated requests
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Authentication middleware
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("No token provided");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AuthenticationError("No token provided");
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    // Add user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError("Token expired"));
    } else {
      next(error);
    }
  }
};

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Access denied. Required roles: ${roles.join(", ")}`
      );
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize(UserRole.ADMIN);

// Teacher or admin middleware
export const teacherOrAdmin = authorize(UserRole.TEACHER, UserRole.ADMIN);

export const adminOrPrincipal = authorize(UserRole.ADMIN, UserRole.PRINCIPAL);

// Principal or admin middleware
// Removed principal role - no longer needed

// Self or admin middleware (for users to access their own resources)
export const selfOrAdmin = (userIdField: string = "userId") => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    const resourceUserId =
      req.params[userIdField] || (req.body as any)?.[userIdField];

    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    if (req.user.userId !== resourceUserId) {
      throw new AuthorizationError(
        "Access denied. You can only access your own resources."
      );
    }

    next();
  };
};

// Teacher assigned to class or admin/principal middleware
export const teacherAssignedToClassOrAdmin = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    // Admin can access all classes
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // For teachers, check if they are assigned to the class
    if (req.user.role === UserRole.TEACHER) {
      const classId =
        (req.params && (req.params.id || req.params.classId)) ||
        (req.query && (req.query.classId as string));

      if (!classId) {
        throw new AuthorizationError("Class ID is required");
      }

      try {
        // Import here to avoid circular dependencies
        const { UserService } = await import("@/services/userService");

        // Get teacher assignments directly
        const assignments = await UserService.getTeacherAssignments(
          req.user.userId
        );
        const isAssigned = assignments.some(
          assignment => assignment.classId === classId
        );

        if (!isAssigned) {
          throw new AuthorizationError(
            "Access denied. You are not assigned to this class."
          );
        }

        next();
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw error;
        }
        throw new AuthorizationError("Failed to verify class assignment");
      }
    } else {
      throw new AuthorizationError(
        "Access denied. Required roles: teacher, admin"
      );
    }
  };
};

// Teacher assigned to student's class or admin/principal middleware
export const teacherAssignedToStudentClassOrAdmin = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    // Admin can access all students
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // For teachers, check if they are assigned to the student's class
    if (req.user.role === UserRole.TEACHER) {
      const studentId = req.params.id || req.params.studentId;
      const classId = (req.params.classId as string) || (req.query.classId as string);

      if (!studentId && !classId) {
        throw new AuthorizationError("Student ID or Class ID is required");
      }

      try {
        // Import here to avoid circular dependencies
        const { UserService } = await import("@/services/userService");
        const { StudentService } = await import("@/services/studentService");

        // Get teacher assignments directly
        const assignments = await UserService.getTeacherAssignments(
          req.user.userId
        );

        let isAssigned = false;

        if (classId) {
          // Direct class access
          isAssigned = assignments.some(
            assignment => assignment.classId === classId
          );
        } else if (studentId) {
          // Student access - need to check student's class
          const student = await StudentService.getById(studentId);
          isAssigned = assignments.some(
            assignment => assignment.classId === student.classId
          );
        }

        if (!isAssigned) {
          throw new AuthorizationError(
            "Access denied. You are not assigned to this student's class."
          );
        }

        next();
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw error;
        }
        throw new AuthorizationError(
          "Failed to verify student class assignment"
        );
      }
    } else {
      throw new AuthorizationError(
        "Access denied. Required roles: teacher, admin"
      );
    }
  };
};

// Teacher from same school or admin middleware (for class access)
export const teacherFromSameSchoolOrAdmin = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    // Admin can access all classes
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // For teachers, check if they are from the same school as the class
    if (req.user.role === UserRole.TEACHER) {
      const classId = req.params.id || req.params.classId;

      if (!classId) {
        throw new AuthorizationError("Class ID is required");
      }

      try {
        // Import here to avoid circular dependencies
        const { UserService } = await import("@/services/userService");
        const { ClassService } = await import("@/services/classService");

        // Get user's school ID
        const user = await UserService.getById(req.user.userId);
        
        // Get class details
        const classData = await ClassService.getById(classId);

        if (user.schoolId !== classData.schoolId) {
          throw new AuthorizationError(
            "Access denied. You can only access classes from your school."
          );
        }

        next();
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw error;
        }
        throw new AuthorizationError("Failed to verify school access: " + error);
      }
    } else {
      throw new AuthorizationError(
        "Access denied. Required roles: teacher, admin"
      );
    }
  };
};

// Teacher from same school or admin middleware (for student access)
export const teacherFromSameSchoolAsStudentOrAdmin = () => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    // Admin can access all students
    if (
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.PRINCIPAL
    ) {
      return next();
    }

    // For teachers, check if they are from the same school as the student
    if (req.user.role === UserRole.TEACHER) {
      const studentId = (req.params && (req.params.id || req.params.studentId)) as
        | string
        | undefined;
      const classId =
        (req.params && (req.params.classIddjkddd as string)) ||
        (req.query && (req.query.classId as string));

      if (!studentId && !classId) {
        throw new AuthorizationError("Student ID or Class ID is required");
      }

      try {
        // Import here to avoid circular dependencies
        const { UserService } = await import("@/services/userService");
        const { StudentService } = await import("@/services/studentService");
        const { ClassService } = await import("@/services/classService");

        // Get user's school ID
        const user = await UserService.getById(req.user.userId);

        let isFromSameSchool = false;

        if (classId) {
          // Direct class access - check if class is from same school
          const classData = await ClassService.getById(classId);
          isFromSameSchool = user.schoolId === classData.schoolId;
        } else if (studentId) {
          // Student access - check if student's class is from same school
          const student = await StudentService.getById(studentId);
          const classData = await ClassService.getById(student.classId);
          isFromSameSchool = user.schoolId === classData.schoolId;
        }

        if (!isFromSameSchool) {
          throw new AuthorizationError(
            "Access denied. You can only access students from your school."
          );
        }

        next();
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw error;
        }
        throw new AuthorizationError(
          "Failed to verify school access for student"
        );
      }
    } else {
      throw new AuthorizationError(
        "Access denied. Required roles: teacher, admin"
      );
    }
  };
};

// Generate JWT token
export const generateToken = (
  payload: Omit<JwtPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (
  payload: Omit<JwtPayload, "iat" | "exp">
): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};
