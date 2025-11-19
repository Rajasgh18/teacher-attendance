import { SubjectController } from "@/controllers/subjectController";
import { authenticate } from "@/middleware/auth";
import { Router } from "express";

const router: Router = Router();

router.use(authenticate);

router.get("/", SubjectController.getAllSubjects);
router.get("/marks", SubjectController.getAllMarks);
router.get("/marks/:id", SubjectController.getMarksById);
router.get("/:id/marks", SubjectController.getSubjectMarks);

router.post("/", SubjectController.createSubject);
router.post("/marks/bulk", SubjectController.createSubjectMarksBulk);

router.get("/:id", SubjectController.getSubjectById);
router.put("/:id", SubjectController.updateSubject);
router.delete("/marks/:id", SubjectController.deleteMarks);

router.delete("/:id", SubjectController.deleteSubject);

export default router;
