import express from "express";
import { UserRole } from "../../../../generated/prisma";
import authMiddleware from "../../middlewares/auth";
import { TaskController } from "./task.controller";

const router = express.Router();

router.get(
  "/my-tasks",
  authMiddleware(UserRole.MEMBER),
  TaskController.getMyTasks,
);
router.get("/stats", TaskController.getTaskStats);
router.get("/", TaskController.getAllTasks);
router.get("/:id", TaskController.getSingleTask);
router.post("/create-task", TaskController.createTask);
router.patch("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

export const TaskRoutes = router;
