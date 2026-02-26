import express from "express";
import { UserRole } from "../../../../generated/prisma";
import authMiddleware from "../../middlewares/auth";
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
  ProjectController.createProject,
);
router.patch(
  "/:id",
  authMiddleware(UserRole.LEADER, UserRole.MEMBER),
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
