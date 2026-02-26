import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AnalyticsService } from "./analytics.service";

const getLeaderDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getLeaderDashboardStats(
      req.query as any,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Leader dashboard stats retrieved successfully",
      data: result,
    });
  },
);

const getMemberDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticsService.getMemberDashboardStats(
      req.user?.id as string,
      req.query as any,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Member dashboard stats retrieved successfully",
      data: result,
    });
  },
);

const getLeaderReports = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getLeaderReports(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leader reports retrieved successfully",
    data: result,
  });
});

export const AnalyticsController = {
  getLeaderDashboardStats,
  getMemberDashboardStats,
  getLeaderReports,
};
