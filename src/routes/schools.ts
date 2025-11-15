import { SchoolController } from "@/controllers/schoolController";
import { authenticate } from "@/middleware/auth";
import { Router } from "express";

const router: Router = Router();

router.use(authenticate)

router.get("/", SchoolController.getAll)

export default router;