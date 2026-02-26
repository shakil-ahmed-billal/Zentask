var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv2 from "dotenv";
import express6 from "express";
import morgan from "morgan";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/app/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
var connectionString = process.env.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/lib/auth.ts
var auth = betterAuth({
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [process.env.FRONTEND_ORIGIN],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (data) => {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
      await transporter.sendMail({
        from: `"Zentask" <${process.env.SMTP_USER}>`,
        to: data.user.email,
        subject: "Reset your Zentask password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2 style="color:#1a1a1a">Reset your password</h2>
            <p>Hi ${data.user.name ?? "there"},</p>
            <p>We received a request to reset your password. Click the button below to choose a new one.</p>
            <a href="${data.url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0">
              Reset Password
            </a>
            <p style="color:#666;font-size:13px">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `
      });
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "MEMBER"
      },
      leaderId: {
        type: "string",
        required: false
      }
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
      // 5 minutes
    }
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false
    },
    disableCSRFCheck: true
    // Allow requests without Origin header (Postman, mobile apps, etc.)
  }
});

// src/app/errors/ApiError.ts
var ApiError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var ApiError_default = ApiError;

// src/app/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config_default = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5e3,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN
  },
  cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET
};

// src/app/middlewares/globalErrorHandler.ts
var globalErrorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong !";
  let errorMessages = [];
  if (error instanceof ApiError_default) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = error.message ? [
      {
        path: "",
        message: error.message
      }
    ] : [];
  } else if (error instanceof Error) {
    message = error.message;
    errorMessages = error.message ? [
      {
        path: "",
        message: error.message
      }
    ] : [];
  }
  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config_default.env !== "production" ? error?.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app/routes/index.ts
import express5 from "express";

// src/app/modules/Analytics/analytics.route.ts
import { UserRole } from "@prisma/client";
import express from "express";

// src/app/middlewares/auth.ts
import httpStatus from "http-status";
var authMiddleware = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: new Headers(req.headers)
      });
      if (!session) {
        throw new ApiError_default(httpStatus.UNAUTHORIZED, "You are not authorized");
      }
      const user = session.user;
      if (roles.length && !roles.includes(user.role)) {
        throw new ApiError_default(httpStatus.FORBIDDEN, "Forbidden");
      }
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = authMiddleware;

// src/app/modules/Analytics/analytics.controller.ts
import httpStatus2 from "http-status";

// src/app/utils/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
var catchAsync_default = catchAsync;

// src/app/utils/sendResponse.ts
var sendResponse = (res, data) => {
  const responseData = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    meta: data.meta || void 0,
    data: data.data || null
  };
  res.status(data.statusCode).json(responseData);
};
var sendResponse_default = sendResponse;

// src/app/modules/Analytics/analytics.service.ts
var getLeaderDashboardStats = async (filters) => {
  const { month, year, fromDate, toDate, status, memberId, search } = filters;
  const dateFilter = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) dateFilter.lte = new Date(toDate);
  if (month && year) {
    dateFilter.gte = new Date(year, month - 1, 1);
    dateFilter.lte = new Date(year, month, 0, 23, 59, 59);
  }
  const where = {};
  if (Object.keys(dateFilter).length) where.createdAt = dateFilter;
  if (status) where.status = status;
  if (memberId) where.members = { some: { userId: memberId } };
  if (search) where.title = { contains: search, mode: "insensitive" };
  const [
    totalProjects,
    completedProjects,
    pendingProjects,
    cancelledProjects,
    inProgressProjects,
    totalDeliveryValue,
    completedValue,
    pendingValue,
    cancelledValue,
    recentProjects
  ] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.count({ where: { ...where, status: "DELIVERED" } }),
    prisma.project.count({ where: { ...where, status: "PENDING" } }),
    prisma.project.count({ where: { ...where, status: "CANCELLED" } }),
    prisma.project.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.project.aggregate({ where, _sum: { deliveryValue: true } }),
    prisma.project.aggregate({
      where: { ...where, status: "DELIVERED" },
      _sum: { deliveryValue: true }
    }),
    prisma.project.aggregate({
      where: { ...where, status: { in: ["PENDING", "IN_PROGRESS"] } },
      _sum: { deliveryValue: true }
    }),
    prisma.project.aggregate({
      where: { ...where, status: "CANCELLED" },
      _sum: { deliveryValue: true }
    }),
    prisma.project.findMany({
      where,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { members: { include: { user: true } }, tasks: true }
    })
  ]);
  return {
    summary: {
      totalProjects,
      completedProjects,
      pendingProjects,
      cancelledProjects,
      inProgressProjects,
      totalDeliveryValue: totalDeliveryValue._sum.deliveryValue || 0,
      deliveredValue: completedValue._sum.deliveryValue || 0
    },
    recentProjects
  };
};
var getMemberDashboardStats = async (userId, filters) => {
  const sevenDaysFromNow = /* @__PURE__ */ new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const where = {
    OR: [{ leaderId: userId }, { members: { some: { userId } } }]
  };
  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }
  const dateFilter = {};
  if (filters?.fromDate) dateFilter.gte = new Date(filters.fromDate);
  if (filters?.toDate) dateFilter.lte = new Date(filters.toDate);
  if (filters?.month && filters?.year) {
    const m = parseInt(filters.month);
    const y = parseInt(filters.year);
    dateFilter.gte = new Date(y, m - 1, 1);
    dateFilter.lte = new Date(y, m, 0, 23, 59, 59);
  }
  if (Object.keys(dateFilter).length > 0) {
    where.createdAt = dateFilter;
  }
  const [
    totalProjects,
    ongoingProjects,
    completedProjects,
    earnedValue,
    pendingValue,
    upcomingDeadlines,
    recentProjects
  ] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.count({
      where: { ...where, status: { not: "DELIVERED" } }
    }),
    prisma.project.count({
      where: { ...where, status: "DELIVERED" }
    }),
    prisma.project.aggregate({
      where: { ...where, status: "DELIVERED" },
      _sum: { deliveryValue: true }
    }),
    prisma.project.aggregate({
      where: { ...where, status: { not: "DELIVERED" } },
      _sum: { deliveryValue: true }
    }),
    prisma.project.findMany({
      where: {
        ...where,
        deadline: { gte: /* @__PURE__ */ new Date(), lte: sevenDaysFromNow }
      },
      orderBy: { deadline: "asc" }
    }),
    prisma.project.findMany({
      where,
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ]);
  const totalTasks = await prisma.task.count({
    where: { memberId: userId }
  });
  const completedTasks = await prisma.task.count({
    where: { memberId: userId, status: "COMPLETED" }
  });
  const avgProgress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
  return {
    summary: {
      totalProjects,
      ongoingProjects,
      completedProjects,
      earnedValue: earnedValue._sum.deliveryValue || 0,
      pendingValue: pendingValue._sum.deliveryValue || 0,
      avgProgress
    },
    upcomingDeadlines,
    recentProjects
  };
};
var getLeaderReports = async (filters) => {
  const { fromDate, toDate, month, year } = filters;
  const dateFilter = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) dateFilter.lte = new Date(toDate);
  if (month && year) {
    dateFilter.gte = new Date(year, month - 1, 1);
    dateFilter.lte = new Date(year, month, 0, 23, 59, 59);
  }
  const where = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
  const [
    totalProjects,
    completedProjects,
    totalValue,
    deliveredValue,
    allMembers
  ] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.count({ where: { ...where, status: "DELIVERED" } }),
    prisma.project.aggregate({ where, _sum: { deliveryValue: true } }),
    prisma.project.aggregate({
      where: { ...where, status: "DELIVERED" },
      _sum: { deliveryValue: true }
    }),
    prisma.user.findMany({
      where: { role: "MEMBER" },
      include: {
        projects: { include: { project: true } },
        tasks: true
      }
    })
  ]);
  const now = /* @__PURE__ */ new Date();
  const monthlyBreakdown = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const [monthProjects, monthCompleted, monthValue, monthDelivered] = await Promise.all([
      prisma.project.count({
        where: { createdAt: { gte: start, lte: end } }
      }),
      prisma.project.count({
        where: { createdAt: { gte: start, lte: end }, status: "DELIVERED" }
      }),
      prisma.project.aggregate({
        where: { createdAt: { gte: start, lte: end } },
        _sum: { deliveryValue: true }
      }),
      prisma.project.aggregate({
        where: { createdAt: { gte: start, lte: end }, status: "DELIVERED" },
        _sum: { deliveryValue: true }
      })
    ]);
    monthlyBreakdown.push({
      month: d.toLocaleString("default", { month: "long", year: "numeric" }),
      projects: monthProjects,
      completed: monthCompleted,
      totalValue: monthValue._sum.deliveryValue || 0,
      delivered: monthDelivered._sum.deliveryValue || 0
    });
  }
  const memberPerformance = allMembers.map((m) => {
    const total = m.projects.length;
    const completed = m.projects.filter(
      (p) => p.project.status === "DELIVERED"
    ).length;
    const totalVal = m.projects.reduce(
      (sum, p) => sum + (p.project.deliveryValue || 0),
      0
    );
    const delivered = m.projects.filter((p) => p.project.status === "DELIVERED").reduce((sum, p) => sum + (p.project.deliveryValue || 0), 0);
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      department: m.department,
      totalProjects: total,
      completed,
      completionRate: total > 0 ? Math.round(completed / total * 100) : 0,
      totalValue: totalVal,
      delivered,
      avgProgress: m.tasks.length > 0 ? Math.round(
        m.tasks.filter((t) => t.status === "COMPLETED").length / m.tasks.length * 100
      ) : 0
    };
  });
  return {
    summary: {
      totalProjects,
      completedProjects,
      totalValue: totalValue._sum.deliveryValue || 0,
      deliveredValue: deliveredValue._sum.deliveryValue || 0,
      activeMembers: allMembers.length
    },
    monthlyBreakdown,
    memberPerformance
  };
};
var AnalyticsService = {
  getLeaderDashboardStats,
  getMemberDashboardStats,
  getLeaderReports
};

// src/app/modules/Analytics/analytics.controller.ts
var getLeaderDashboardStats2 = catchAsync_default(
  async (req, res) => {
    const result = await AnalyticsService.getLeaderDashboardStats(
      req.query
    );
    sendResponse_default(res, {
      statusCode: httpStatus2.OK,
      success: true,
      message: "Leader dashboard stats retrieved successfully",
      data: result
    });
  }
);
var getMemberDashboardStats2 = catchAsync_default(
  async (req, res) => {
    const result = await AnalyticsService.getMemberDashboardStats(
      req.user?.id,
      req.query
    );
    sendResponse_default(res, {
      statusCode: httpStatus2.OK,
      success: true,
      message: "Member dashboard stats retrieved successfully",
      data: result
    });
  }
);
var getLeaderReports2 = catchAsync_default(async (req, res) => {
  const result = await AnalyticsService.getLeaderReports(req.query);
  sendResponse_default(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "Leader reports retrieved successfully",
    data: result
  });
});
var AnalyticsController = {
  getLeaderDashboardStats: getLeaderDashboardStats2,
  getMemberDashboardStats: getMemberDashboardStats2,
  getLeaderReports: getLeaderReports2
};

// src/app/modules/Analytics/analytics.route.ts
var router = express.Router();
router.get(
  "/leader/stats",
  auth_default(UserRole.LEADER),
  AnalyticsController.getLeaderDashboardStats
);
router.get(
  "/leader/reports",
  auth_default(UserRole.LEADER),
  AnalyticsController.getLeaderReports
);
router.get(
  "/member/stats",
  auth_default(UserRole.MEMBER),
  AnalyticsController.getMemberDashboardStats
);
var AnalyticsRoutes = router;

// src/app/modules/Project/project.route.ts
import { UserRole as UserRole2 } from "@prisma/client";
import express2 from "express";

// src/app/middlewares/upload.ts
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// src/app/modules/Project/project.controller.ts
import httpStatus3 from "http-status";

// src/app/utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: config_default.cloudinaryName,
  api_key: config_default.cloudinaryApiKey,
  api_secret: config_default.cloudinaryApiSecret
});
var CloudinaryHelper = {
  uploadImage: async (fileBuffer, folder = "zentask") => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url);
        }
      );
      const streamifier = __require("streamifier");
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  },
  deleteImage: async (url) => {
    try {
      if (!url) return false;
      const parts = url.split("/");
      const filename = parts[parts.length - 1];
      const publicId = filename.split(".")[0];
      const result = await cloudinary.uploader.destroy(`zentask/${publicId}`);
      return result.result === "ok";
    } catch (error) {
      console.error("Cloudinary deletion error:", error);
      return false;
    }
  }
};

// src/app/modules/Project/project.service.ts
var createProjectInDB = async (data) => {
  const formattedData = { ...data };
  if (formattedData.startDate)
    formattedData.startDate = new Date(formattedData.startDate);
  if (formattedData.deadline)
    formattedData.deadline = new Date(formattedData.deadline);
  return prisma.project.create({ data: formattedData });
};
var getAllProjectsFromDB = async (filters) => {
  const {
    status,
    search,
    memberId,
    leaderId,
    fromDate,
    toDate,
    month,
    year,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = filters;
  const where = {};
  if (status) where.status = status;
  if (leaderId) where.leaderId = leaderId;
  if (memberId) where.members = { some: { userId: memberId } };
  if (search) where.title = { contains: search, mode: "insensitive" };
  const dateFilter = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) {
    const end = new Date(toDate);
    end.setUTCHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }
  if (month && year) {
    const m = parseInt(month);
    const y = parseInt(year);
    dateFilter.gte = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    dateFilter.lte = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  }
  if (Object.keys(dateFilter).length) where.createdAt = dateFilter;
  const validSortFields = ["createdAt", "deadline", "title"];
  const orderByField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  return prisma.project.findMany({
    where,
    orderBy: { [orderByField]: sortOrder === "asc" ? "asc" : "desc" },
    include: {
      leader: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      tasks: { select: { id: true, status: true } }
    }
  });
};
var getMemberProjectsFromDB = async (userId, filters) => {
  const where = {
    OR: [{ leaderId: userId }, { members: { some: { userId } } }]
  };
  if (filters) {
    const { status, search, month, year } = filters;
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: "insensitive" };
    const dateFilter = {};
    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      dateFilter.gte = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
      dateFilter.lte = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    }
    if (Object.keys(dateFilter).length) where.createdAt = dateFilter;
  }
  const validSortFields = ["createdAt", "deadline", "title"];
  const sortBy = filters?.sortBy;
  const sortOrder = filters?.sortOrder;
  const orderByField = sortBy && validSortFields.includes(sortBy) ? sortBy : "createdAt";
  return prisma.project.findMany({
    where,
    orderBy: { [orderByField]: sortOrder === "asc" ? "asc" : "desc" },
    include: {
      leader: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
      tasks: { where: { memberId: userId } }
    }
  });
};
var getSingleProjectFromDB = async (id) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      leader: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      tasks: { include: { member: { select: { id: true, name: true } } } }
    }
  });
};
var updateProjectInDB = async (id, data) => {
  const formattedData = { ...data };
  if (formattedData.startDate)
    formattedData.startDate = new Date(formattedData.startDate);
  if (formattedData.deadline)
    formattedData.deadline = new Date(formattedData.deadline);
  return prisma.project.update({ where: { id }, data: formattedData });
};
var deleteProjectFromDB = async (id) => {
  await prisma.task.deleteMany({ where: { projectId: id } });
  await prisma.memberProject.deleteMany({ where: { projectId: id } });
  return prisma.project.delete({ where: { id } });
};
var assignMemberToProjectInDB = async (projectId, userId) => {
  return prisma.memberProject.upsert({
    where: { userId_projectId: { userId, projectId } },
    create: { projectId, userId },
    update: {}
  });
};
var removeMemberFromProjectInDB = async (projectId, userId) => {
  return prisma.memberProject.delete({
    where: { userId_projectId: { userId, projectId } }
  });
};
var ProjectService = {
  createProjectInDB,
  getAllProjectsFromDB,
  getMemberProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectInDB,
  deleteProjectFromDB,
  assignMemberToProjectInDB,
  removeMemberFromProjectInDB
};

// src/app/modules/Project/project.controller.ts
var createProject = catchAsync_default(async (req, res) => {
  let projectPhotoURL = req.body.projectPhotoURL;
  if (req.file) {
    projectPhotoURL = await CloudinaryHelper.uploadImage(req.file.buffer);
  }
  try {
    const { deliveryValue, progress, ...rest } = req.body;
    const projectData = {
      ...rest,
      ...deliveryValue !== void 0 && {
        deliveryValue: Number(deliveryValue)
      },
      ...progress !== void 0 && { progress: Number(progress) }
    };
    const result = await ProjectService.createProjectInDB({
      ...projectData,
      leaderId: req.user?.id,
      ...projectPhotoURL && { projectPhotoURL }
    });
    sendResponse_default(res, {
      statusCode: httpStatus3.CREATED,
      success: true,
      message: "Project created successfully",
      data: result
    });
  } catch (error) {
    if (projectPhotoURL) {
      await CloudinaryHelper.deleteImage(projectPhotoURL);
    }
    throw error;
  }
});
var getAllProjects = catchAsync_default(async (req, res) => {
  const result = await ProjectService.getAllProjectsFromDB(req.query);
  sendResponse_default(res, {
    statusCode: httpStatus3.OK,
    success: true,
    message: "Projects fetched successfully",
    data: result
  });
});
var getMyProjects = catchAsync_default(async (req, res) => {
  const result = await ProjectService.getMemberProjectsFromDB(
    req.user?.id,
    req.query
  );
  sendResponse_default(res, {
    statusCode: httpStatus3.OK,
    success: true,
    message: "Your projects fetched successfully",
    data: result
  });
});
var getSingleProject = catchAsync_default(async (req, res) => {
  const result = await ProjectService.getSingleProjectFromDB(
    req.params.id
  );
  sendResponse_default(res, {
    statusCode: httpStatus3.OK,
    success: true,
    message: "Project fetched successfully",
    data: result
  });
});
var updateProject = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const project = await ProjectService.getSingleProjectFromDB(id);
  if (!project) {
    return sendResponse_default(res, {
      statusCode: httpStatus3.NOT_FOUND,
      success: false,
      message: "Project not found",
      data: null
    });
  }
  const isLeader = project.leaderId === userId;
  const isMember = project.members.some((m) => m.userId === userId);
  if (!isLeader && !isMember) {
    return sendResponse_default(res, {
      statusCode: httpStatus3.FORBIDDEN,
      success: false,
      message: "You are not authorized to update this project",
      data: null
    });
  }
  let projectPhotoURL = req.body.projectPhotoURL;
  if (req.file) {
    projectPhotoURL = await CloudinaryHelper.uploadImage(req.file.buffer);
    if (project.projectPhotoURL) {
      CloudinaryHelper.deleteImage(project.projectPhotoURL).catch(
        console.error
      );
    }
  }
  const { deliveryValue, progress, ...rest } = req.body;
  const updatePayload = {
    ...rest,
    ...deliveryValue !== void 0 && {
      deliveryValue: Number(deliveryValue)
    },
    ...progress !== void 0 && { progress: Number(progress) },
    ...projectPhotoURL && { projectPhotoURL }
  };
  const result = await ProjectService.updateProjectInDB(
    id,
    updatePayload
  );
  sendResponse_default(res, {
    statusCode: httpStatus3.OK,
    success: true,
    message: "Project updated successfully",
    data: result
  });
});
var deleteProject = catchAsync_default(async (req, res) => {
  const result = await ProjectService.deleteProjectFromDB(
    req.params.id
  );
  sendResponse_default(res, {
    statusCode: httpStatus3.OK,
    success: true,
    message: "Project deleted successfully",
    data: result
  });
});
var assignMember = catchAsync_default(async (req, res) => {
  const { projectId, userId } = req.body;
  const result = await ProjectService.assignMemberToProjectInDB(
    projectId,
    userId
  );
  sendResponse_default(res, {
    statusCode: httpStatus3.OK,
    success: true,
    message: "Member assigned successfully",
    data: result
  });
});
var removeMember = catchAsync_default(async (req, res) => {
  const { projectId, userId } = req.body;
  const result = await ProjectService.removeMemberFromProjectInDB(
    projectId,
    userId
  );
  sendResponse_default(res, {
    statusCode: httpStatus3.OK,
    success: true,
    message: "Member removed successfully",
    data: result
  });
});
var ProjectController = {
  createProject,
  getAllProjects,
  getMyProjects,
  getSingleProject,
  updateProject,
  deleteProject,
  assignMember,
  removeMember
};

// src/app/modules/Project/project.route.ts
var router2 = express2.Router();
router2.get(
  "/my-projects",
  auth_default(UserRole2.MEMBER),
  ProjectController.getMyProjects
);
router2.get("/:id", ProjectController.getSingleProject);
router2.post(
  "/create-project",
  auth_default(UserRole2.LEADER, UserRole2.MEMBER),
  upload.single("image"),
  ProjectController.createProject
);
router2.patch(
  "/:id",
  auth_default(UserRole2.LEADER, UserRole2.MEMBER),
  upload.single("image"),
  ProjectController.updateProject
);
router2.delete(
  "/:id",
  auth_default(UserRole2.LEADER, UserRole2.MEMBER),
  ProjectController.deleteProject
);
router2.post(
  "/assign-member",
  auth_default(UserRole2.LEADER),
  ProjectController.assignMember
);
router2.post(
  "/remove-member",
  auth_default(UserRole2.LEADER),
  ProjectController.removeMember
);
router2.get("/", ProjectController.getAllProjects);
var ProjectRoutes = router2;

// src/app/modules/Task/task.route.ts
import { UserRole as UserRole3 } from "@prisma/client";
import express3 from "express";

// src/app/modules/Task/task.controller.ts
import httpStatus4 from "http-status";

// src/app/modules/Task/task.service.ts
var createTaskInDB = async (data) => {
  const { assignedToId, projectId, memberId, ...rest } = data;
  const taskData = { ...rest };
  if (projectId) {
    taskData.project = { connect: { id: projectId } };
  }
  const targetMemberId = assignedToId || data.memberId;
  if (!targetMemberId) {
    throw new Error("Target member is required for task creation");
  }
  taskData.member = { connect: { id: targetMemberId } };
  if (taskData.deadline) taskData.deadline = new Date(taskData.deadline);
  return prisma.task.create({
    data: taskData,
    include: {
      project: { select: { id: true, title: true } },
      member: { select: { id: true, name: true } }
    }
  });
};
var getAllTasksFromDB = async (filters) => {
  const {
    status,
    priority,
    projectId,
    assignedToId,
    search,
    fromDate,
    toDate
  } = filters;
  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (projectId) where.projectId = projectId;
  if (assignedToId) where.memberId = assignedToId;
  if (search) where.title = { contains: search, mode: "insensitive" };
  const dateFilter = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) dateFilter.lte = new Date(toDate);
  if (Object.keys(dateFilter).length) where.createdAt = dateFilter;
  return prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, title: true } },
      member: { select: { id: true, name: true } }
    }
  });
};
var getMyTasksFromDB = async (userId, filters) => {
  const { status, priority, projectId, search } = filters;
  const where = { memberId: userId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (projectId) where.projectId = projectId;
  if (search) where.title = { contains: search, mode: "insensitive" };
  return prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, title: true } }
    }
  });
};
var getTaskStatsFromDB = async (userId) => {
  const where = userId ? { memberId: userId } : {};
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, status: "PENDING" } }),
    prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...where, status: "COMPLETED" } })
  ]);
  return { total, pending, inProgress, completed };
};
var getSingleTaskFromDB = async (id) => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      member: { select: { id: true, name: true, email: true } }
    }
  });
};
var updateTaskInDB = async (id, data) => {
  return prisma.task.update({ where: { id }, data });
};
var deleteTaskFromDB = async (id) => {
  return prisma.task.delete({ where: { id } });
};
var TaskService = {
  createTaskInDB,
  getAllTasksFromDB,
  getMyTasksFromDB,
  getTaskStatsFromDB,
  getSingleTaskFromDB,
  updateTaskInDB,
  deleteTaskFromDB
};

// src/app/modules/Task/task.controller.ts
var createTask = catchAsync_default(async (req, res) => {
  const result = await TaskService.createTaskInDB({
    ...req.body,
    memberId: req.user?.id
  });
  sendResponse_default(res, {
    statusCode: httpStatus4.CREATED,
    success: true,
    message: "Task created successfully",
    data: result
  });
});
var getAllTasks = catchAsync_default(async (req, res) => {
  const result = await TaskService.getAllTasksFromDB(req.query);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Tasks fetched successfully",
    data: result
  });
});
var getMyTasks = catchAsync_default(async (req, res) => {
  const result = await TaskService.getMyTasksFromDB(
    req.user?.id,
    req.query
  );
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Your tasks fetched",
    data: result
  });
});
var getTaskStats = catchAsync_default(async (req, res) => {
  const userId = req.user?.role === "MEMBER" ? req.user?.id : void 0;
  const result = await TaskService.getTaskStatsFromDB(userId);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Task stats fetched",
    data: result
  });
});
var getSingleTask = catchAsync_default(async (req, res) => {
  const result = await TaskService.getSingleTaskFromDB(req.params.id);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Task fetched successfully",
    data: result
  });
});
var updateTask = catchAsync_default(async (req, res) => {
  const result = await TaskService.updateTaskInDB(
    req.params.id,
    req.body
  );
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Task updated successfully",
    data: result
  });
});
var deleteTask = catchAsync_default(async (req, res) => {
  const result = await TaskService.deleteTaskFromDB(req.params.id);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Task deleted successfully",
    data: result
  });
});
var TaskController = {
  createTask,
  getAllTasks,
  getMyTasks,
  getTaskStats,
  getSingleTask,
  updateTask,
  deleteTask
};

// src/app/modules/Task/task.route.ts
var router3 = express3.Router();
router3.get(
  "/my-tasks",
  auth_default(UserRole3.MEMBER),
  TaskController.getMyTasks
);
router3.get("/stats", TaskController.getTaskStats);
router3.get("/", TaskController.getAllTasks);
router3.get("/:id", TaskController.getSingleTask);
router3.post("/create-task", auth_default(), TaskController.createTask);
router3.patch("/:id", auth_default(), TaskController.updateTask);
router3.delete("/:id", auth_default(), TaskController.deleteTask);
var TaskRoutes = router3;

// src/app/modules/User/user.route.ts
import { UserRole as UserRole4 } from "@prisma/client";
import express4 from "express";

// src/app/modules/User/user.controller.ts
import httpStatus5 from "http-status";

// src/app/modules/User/user.service.ts
var getAllUsersFromDB = async (filters) => {
  const { role, isVerified, status, department, searchTerm } = filters;
  const where = {};
  if (role) where.role = role;
  if (isVerified !== void 0) where.isVerified = isVerified;
  if (status) where.status = status;
  if (department) where.department = department;
  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } }
    ];
  }
  console.log("Querying users with where:", JSON.stringify(where, null, 2));
  const result = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          projects: true,
          tasks: true
        }
      }
    }
  });
  return result;
};
var getSingleUserFromDB = async (id) => {
  const result = await prisma.user.findUnique({
    where: {
      id
    }
  });
  return result;
};
var updateProfileInDB = async (id, data) => {
  const result = await prisma.user.update({
    where: {
      id
    },
    data
  });
  return result;
};
var UserService = {
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateProfileInDB
};

// src/app/modules/User/user.controller.ts
var getAllUsers = catchAsync_default(async (req, res) => {
  const query = { ...req.query };
  if (query.isVerified !== void 0) {
    query.isVerified = query.isVerified === "true";
  }
  const result = await UserService.getAllUsersFromDB(query);
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Users fetched successfully",
    data: result
  });
});
var getSingleUser = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.getSingleUserFromDB(id);
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "User fetched successfully",
    data: result
  });
});
var updateProfile = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.updateProfileInDB(id, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});
var verifyUser = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.updateProfileInDB(id, {
    isVerified: true
  });
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "User verified successfully",
    data: result
  });
});
var suspendUser = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await UserService.updateProfileInDB(id, { status });
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: `User status updated to ${status}`,
    data: result
  });
});
var getAllLeaders = catchAsync_default(async (req, res) => {
  const result = await UserService.getAllUsersFromDB({
    role: "LEADER",
    isVerified: true,
    status: "ACTIVE"
  });
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Leaders fetched successfully",
    data: result
  });
});
var UserController = {
  getAllUsers,
  getAllLeaders,
  getSingleUser,
  updateProfile,
  verifyUser,
  suspendUser
};

// src/app/modules/User/user.route.ts
var router4 = express4.Router();
router4.get("/", UserController.getAllUsers);
router4.get("/leaders", UserController.getAllLeaders);
router4.get("/:id", UserController.getSingleUser);
router4.patch("/:id", UserController.updateProfile);
router4.post(
  "/verify/:id",
  auth_default(UserRole4.LEADER),
  UserController.verifyUser
);
router4.post(
  "/suspend/:id",
  auth_default(UserRole4.LEADER),
  UserController.suspendUser
);
var UserRoutes = router4;

// src/app/routes/index.ts
var router5 = express5.Router();
var moduleRoutes = [
  {
    path: "/analytics",
    route: AnalyticsRoutes
  },
  {
    path: "/users",
    route: UserRoutes
  },
  {
    path: "/projects",
    route: ProjectRoutes
  },
  {
    path: "/tasks",
    route: TaskRoutes
  }
];
moduleRoutes.forEach((route) => router5.use(route.path, route.route));
var routes_default = router5;

// src/app.ts
dotenv2.config();
var app = express6();
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL
  // Production frontend URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(cookieParser());
app.use(express6.json());
app.use(express6.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.all("/api/v1/auth/*splat", toNodeHandler(auth));
app.use("/api", routes_default);
app.get("/", (req, res) => {
  res.send({
    Message: "WorkSphere Server is running..."
  });
});
app.use(globalErrorHandler_default);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Not Found"
      }
    ]
  });
});
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
