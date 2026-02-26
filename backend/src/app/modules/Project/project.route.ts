import { UserRole } from "@prisma/client";
import express from "express";
import authMiddleware from "../../middlewares/auth";
import { upload } from "../../middlewares/upload";
import { ProjectController } from "./project.controller";

const router = express.Router();

// Public / shared
router.get(
  "/my-projects",
  authMiddleware(UserRole.MEMBER),
  ProjectController.getMyProjects,
);
router.get("/:id", ProjectController.getSingleProject);

// Leader & Member
router.post(
  "/create-project",
  authMiddleware(UserRole.LEADER, UserRole.MEMBER),
  upload.single("image"),
  ProjectController.createProject,
);
router.patch(
  "/:id",
  authMiddleware(UserRole.LEADER, UserRole.MEMBER),
  upload.single("image"),
  ProjectController.updateProject,
);
router.delete(
  "/:id",
  authMiddleware(UserRole.LEADER, UserRole.MEMBER),
  ProjectController.deleteProject,
);
router.post(
  "/assign-member",
  authMiddleware(UserRole.LEADER),
  ProjectController.assignMember,
);
router.post(
  "/remove-member",
  authMiddleware(UserRole.LEADER),
  ProjectController.removeMember,
);

// Shared
router.get("/", ProjectController.getAllProjects);

export const ProjectRoutes = router;
