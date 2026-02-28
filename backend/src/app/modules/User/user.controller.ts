import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = { ...req.query } as any;
  // Parse boolean from string
  if (query.isVerified !== undefined) {
    query.isVerified = query.isVerified === "true";
  }
  const result = await UserService.getAllUsersFromDB(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await UserService.getSingleUserFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await UserService.updateProfileInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateProfileInDB(id as string, {
    isVerified: true,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User verified successfully",
    data: result,
  });
});

const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // ACTIVE or SUSPENDED
  const result = await UserService.updateProfileInDB(id as string, { status });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User status updated to ${status}`,
    data: result,
  });
});

const getAllLeaders = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsersFromDB({
    role: "LEADER",
    status: "ACTIVE",
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leaders fetched successfully",
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getAllLeaders,
  getSingleUser,
  updateProfile,
  verifyUser,
  suspendUser,
};
