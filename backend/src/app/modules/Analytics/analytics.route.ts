import { UserRole } from "@prisma/client";
import express from "express";
import authMiddleware from "../../middlewares/auth";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

router.get(
  "/leader/stats",
  authMiddleware(UserRole.LEADER),
  AnalyticsController.getLeaderDashboardStats,
);
router.get(
  "/leader/reports",
  authMiddleware(UserRole.LEADER),
  AnalyticsController.getLeaderReports,
);
router.get(
  "/member/stats",
  authMiddleware(UserRole.MEMBER),
  AnalyticsController.getMemberDashboardStats,
);

export const AnalyticsRoutes = router;
