import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TaskService } from "./task.service";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.createTaskInDB({
    ...req.body,
    memberId: req.user?.id,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Task created successfully",
    data: result,
  });
});

const getAllTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.getAllTasksFromDB(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks fetched successfully",
    data: result,
  });
});

const getMyTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.getMyTasksFromDB(
    req.user?.id as string,
    req.query as any,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your tasks fetched",
    data: result,
  });
});

const getTaskStats = catchAsync(async (req: Request, res: Response) => {
  const userId =
    (req.user as any)?.role === "MEMBER" ? (req.user as any)?.id : undefined;
  const result = await TaskService.getTaskStatsFromDB(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task stats fetched",
    data: result,
  });
});

const getSingleTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.getSingleTaskFromDB(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task fetched successfully",
    data: result,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.updateTaskInDB(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated successfully",
    data: result,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.deleteTaskFromDB(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task deleted successfully",
    data: result,
  });
});

export const TaskController = {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskStats,
  getSingleTask,
  updateTask,
  deleteTask,
};
