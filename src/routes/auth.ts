import express, { Router } from "express";
import { AuthController } from "@/controllers/authController";
import { authenticate } from "@/middleware/auth";
import {
  joiSchemas,
  userValidations,
  validateWithJoi,
} from "@/middleware/validation";
import { authRateLimiter } from "@/middleware/security";

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
  userValidations.email,
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  validateWithJoi(joiSchemas.resetPassword),
  AuthController.resetPassword
);

export default router;
