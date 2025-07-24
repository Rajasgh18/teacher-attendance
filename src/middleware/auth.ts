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

// Principal or admin middleware
export const principalOrAdmin = authorize(UserRole.PRINCIPAL, UserRole.ADMIN);

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
