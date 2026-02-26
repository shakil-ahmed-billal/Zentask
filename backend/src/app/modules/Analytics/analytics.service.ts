import { prisma } from "../../lib/prisma";

// ──────────────────────────────────────────
// Leader Stats
// ──────────────────────────────────────────
const getLeaderDashboardStats = async (filters: {
  month?: number;
  year?: number;
  fromDate?: string;
  toDate?: string;
  status?: string;
  memberId?: string;
  search?: string;
}) => {
  const { month, year, fromDate, toDate, status, memberId, search } = filters;

  const dateFilter: any = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) dateFilter.lte = new Date(toDate);
  if (month && year) {
    dateFilter.gte = new Date(year, month - 1, 1);
    dateFilter.lte = new Date(year, month, 0, 23, 59, 59);
  }

  const where: any = {};
  if (Object.keys(dateFilter).length) where.createdAt = dateFilter;
  if (status) where.status = status;
  if (memberId) where.members = { some: { userId: memberId } };
  if (search) where.name = { contains: search, mode: "insensitive" };

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
    recentProjects,
  ] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.project.count({ where: { ...where, status: "PENDING" } }),
    prisma.project.count({ where: { ...where, status: "CANCELLED" } }),
    prisma.project.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.project.aggregate({ where, _sum: { deliveryValue: true } }),
    prisma.project.aggregate({
      where: { ...where, status: "COMPLETED" },
      _sum: { deliveryValue: true },
    }),
    prisma.project.aggregate({
      where: { ...where, status: { in: ["PENDING", "IN_PROGRESS"] } },
      _sum: { deliveryValue: true },
    }),
    prisma.project.aggregate({
      where: { ...where, status: "CANCELLED" },
      _sum: { deliveryValue: true },
    }),
    prisma.project.findMany({
      where,
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { members: { include: { user: true } }, tasks: true },
    }),
  ]);

  return {
    summary: {
      totalProjects,
      completedProjects,
      pendingProjects,
      cancelledProjects,
      inProgressProjects,
      totalDeliveryValue: totalDeliveryValue._sum.deliveryValue || 0,
      completedValue: completedValue._sum.deliveryValue || 0,
      pendingValue: pendingValue._sum.deliveryValue || 0,
      cancelledValue: cancelledValue._sum.deliveryValue || 0,
    },
    recentProjects,
  };
};

// ──────────────────────────────────────────
// Member Stats
// ──────────────────────────────────────────
const getMemberDashboardStats = async (userId: string) => {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [
    totalProjects,
    ongoingProjects,
    completedProjects,
    earnedValue,
    pendingValue,
    upcomingDeadlines,
    recentProjects,
  ] = await Promise.all([
    prisma.memberProject.count({ where: { userId } }),
    prisma.memberProject.count({
      where: { userId, project: { status: { not: "COMPLETED" } } },
    }),
    prisma.memberProject.count({
      where: { userId, project: { status: "COMPLETED" } },
    }),
    prisma.project.aggregate({
      where: { members: { some: { userId } }, status: "COMPLETED" },
      _sum: { deliveryValue: true },
    }),
    prisma.project.aggregate({
      where: { members: { some: { userId } }, status: { not: "COMPLETED" } },
      _sum: { deliveryValue: true },
    }),
    prisma.project.findMany({
      where: {
        members: { some: { userId } },
        deadline: { gte: new Date(), lte: sevenDaysFromNow },
      },
      orderBy: { deadline: "asc" },
    }),
    prisma.project.findMany({
      where: { members: { some: { userId } } },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalTasks = await prisma.task.count({
    where: { memberId: userId },
  });
  const completedTasks = await prisma.task.count({
    where: { memberId: userId, status: "COMPLETED" },
  });
  const avgProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    summary: {
      totalProjects,
      ongoingProjects,
      completedProjects,
      earnedValue: earnedValue._sum.deliveryValue || 0,
      pendingValue: pendingValue._sum.deliveryValue || 0,
      avgProgress,
    },
    upcomingDeadlines,
    recentProjects,
  };
};

// ──────────────────────────────────────────
// Leader Reports
// ──────────────────────────────────────────
const getLeaderReports = async (filters: {
  fromDate?: string;
  toDate?: string;
  month?: number;
  year?: number;
}) => {
  const { fromDate, toDate, month, year } = filters;

  const dateFilter: any = {};
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
    allMembers,
  ] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.project.aggregate({ where, _sum: { deliveryValue: true } }),
    prisma.project.aggregate({
      where: { ...where, status: "COMPLETED" },
      _sum: { deliveryValue: true },
    }),
    prisma.user.findMany({
      where: { role: "MEMBER" },
      include: {
        projects: { include: { project: true } },
        tasks: true,
      },
    }),
  ]);

  // Monthly breakdown (last 6 months)
  const now = new Date();
  const monthlyBreakdown = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const [monthProjects, monthCompleted, monthValue, monthDelivered] =
      await Promise.all([
        prisma.project.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        prisma.project.count({
          where: { createdAt: { gte: start, lte: end }, status: "COMPLETED" },
        }),
        prisma.project.aggregate({
          where: { createdAt: { gte: start, lte: end } },
          _sum: { deliveryValue: true },
        }),
        prisma.project.aggregate({
          where: { createdAt: { gte: start, lte: end }, status: "COMPLETED" },
          _sum: { deliveryValue: true },
        }),
      ]);
    monthlyBreakdown.push({
      month: d.toLocaleString("default", { month: "long", year: "numeric" }),
      projects: monthProjects,
      completed: monthCompleted,
      totalValue: monthValue._sum.deliveryValue || 0,
      delivered: monthDelivered._sum.deliveryValue || 0,
    });
  }

  // Member performance
  const memberPerformance = allMembers.map((m) => {
    const total = m.projects.length;
    const completed = m.projects.filter(
      (p) => p.project.status === "COMPLETED",
    ).length;
    const totalVal = m.projects.reduce(
      (sum, p) => sum + (p.project.deliveryValue || 0),
      0,
    );
    const delivered = m.projects
      .filter((p) => p.project.status === "COMPLETED")
      .reduce((sum, p) => sum + (p.project.deliveryValue || 0), 0);
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      department: m.department,
      totalProjects: total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalValue: totalVal,
      delivered,
      avgProgress:
        m.tasks.length > 0
          ? Math.round(
              (m.tasks.filter((t) => t.status === "COMPLETED").length /
                m.tasks.length) *
                100,
            )
          : 0,
    };
  });

  return {
    summary: {
      totalProjects,
      completedProjects,
      totalValue: totalValue._sum.deliveryValue || 0,
      deliveredValue: deliveredValue._sum.deliveryValue || 0,
      activeMembers: allMembers.length,
    },
    monthlyBreakdown,
    memberPerformance,
  };
};

export const AnalyticsService = {
  getLeaderDashboardStats,
  getMemberDashboardStats,
  getLeaderReports,
};
