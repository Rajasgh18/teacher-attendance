import { Router } from "express";

import {
  authenticate,
  adminOnly,
  teacherOrAdmin,
  teacherFromSameSchoolOrAdmin,
  adminOrPrincipal,
} from "@/middleware/auth";
import { ClassController } from "@/controllers/classController";

const router: Router = Router();

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by all authenticated users (teachers, admins)
router.get("/", ClassController.getAll);

// IMPORTANT: Define static routes BEFORE parameterized routes to avoid matching ":id" with "students"/"teachers"
router.get(
  "/students",
  ClassController.getStudents
);
router.get(
  "/teachers",

  ClassController.getTeachers
);
// Routes accessible by teachers from same school and admins
router.get("/:id", ClassController.getById);

// Routes accessible by admins only
router.post("/", adminOrPrincipal, ClassController.create);
router.put("/:id", adminOrPrincipal, ClassController.update);
router.delete("/:id", adminOrPrincipal, ClassController.delete);

export default router;
