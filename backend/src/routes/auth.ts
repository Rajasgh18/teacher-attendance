import express, { Router } from "express";

import {
  joiSchemas,
  userValidations,
  validateWithJoi,
  createValidationMiddleware,
  commonValidations,
} from "@/middleware/validation";
import { authenticate } from "@/middleware/auth";
import { authRateLimiter } from "@/middleware/security";
import { AuthController } from "@/controllers/authController";

const router: express.Router = Router();

// router.use(authRateLimiter);
router.post("/register", userValidations.create, AuthController.register);
router.post("/login", userValidations.login, AuthController.login);
router.post(
  "/refresh",
  validateWithJoi(joiSchemas.refreshToken),
  AuthController.refreshToken
);
router.post("/logout", authenticate, AuthController.logout);
router.get("/me", authenticate, AuthController.getProfile);
router.put(
  "/change-password",
  authenticate,
  validateWithJoi(joiSchemas.changePassword),
  AuthController.changePassword
);
router.post(
  "/forgot-password",
  createValidationMiddleware([commonValidations.employeeId]),
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  validateWithJoi(joiSchemas.resetPassword),
  AuthController.resetPassword
);

export default router;
