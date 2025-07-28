import { Router } from "express";

import {
  adminOnly,
  selfOrAdmin,
  authenticate,
  principalOrAdmin,
} from "@/middleware/auth";
import { userRateLimiter } from "@/middleware/security";
import { UserController } from "@/controllers/userController";

const router: Router = Router();

// Apply rate limiting to all user routes
// router.use(userRateLimiter);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, principals, admins)
router.get("/profile", UserController.getProfile);

// Routes accessible by principals and admins only
router.get(
  "/teachers",
  principalOrAdmin,
  UserController.getWithTeacherProfiles
);

// Routes accessible by admins only
router.get("/", adminOnly, UserController.getAll);
router.get("/all", adminOnly, UserController.getAllUsers);
router.get("/stats", adminOnly, UserController.getUserStats);
router.get("/search", adminOnly, UserController.searchUsers);
router.get("/role/:role", adminOnly, UserController.getByRole);
router.get("/email/:email", adminOnly, UserController.getByEmail);
router.get("/:id", selfOrAdmin, UserController.getById);

// Routes accessible by admins only
router.post("/", adminOnly, UserController.create);

router.put("/:id", selfOrAdmin, UserController.update);
router.put("/:id/password", selfOrAdmin, UserController.updatePassword);
router.put("/:id/change-password", selfOrAdmin, UserController.changePassword);

router.delete("/:id", adminOnly, UserController.delete);

export default router;
