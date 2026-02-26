import { UserRole } from "@prisma/client";
import express from "express";
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
router.post("/create-task", authMiddleware(), TaskController.createTask);
router.patch("/:id", authMiddleware(), TaskController.updateTask);
router.delete("/:id", authMiddleware(), TaskController.deleteTask);

export const TaskRoutes = router;
