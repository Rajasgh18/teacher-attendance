import { Router } from "express";

import { subjectRateLimiter } from "@/middleware/security";
import { SubjectController } from "@/controllers/subjectController";
import { authenticate, adminOnly, teacherOrAdmin } from "@/middleware/auth";

const router: Router = Router();

// Apply rate limiting to all subject routes
// router.use(subjectRateLimiter);

// Public routes (no authentication required)
router.get("/active", SubjectController.getActive);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, admins)
router.get("/", SubjectController.getAll);
router.get("/:id", SubjectController.getById);
router.get("/code/:code", SubjectController.getByCode);
router.get("/field/:field", SubjectController.getByField);

// Routes accessible by admins only
router.post("/", adminOnly, SubjectController.create);
router.put("/:id", adminOnly, SubjectController.update);
router.delete("/:id", adminOnly, SubjectController.delete);
router.delete("/:id/hard", adminOnly, SubjectController.hardDelete);

export default router;
