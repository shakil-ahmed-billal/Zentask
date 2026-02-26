import { prisma } from "../../lib/prisma";

const createTaskInDB = async (data: any) => {
  // Map assignedToId → memberId for schema compatibility
  const { assignedToId, ...rest } = data;
  const taskData: any = { ...rest };
  if (assignedToId) taskData.memberId = assignedToId;

  return prisma.task.create({
    data: taskData,
    include: {
      project: { select: { id: true, name: true } },
      member: { select: { id: true, name: true } },
    },
  });
};

const getAllTasksFromDB = async (filters: {
  status?: string;
  priority?: string;
  projectId?: string;
  assignedToId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const {
    status,
    priority,
    projectId,
    assignedToId,
    search,
    fromDate,
    toDate,
  } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (projectId) where.projectId = projectId;
  if (assignedToId) where.memberId = assignedToId;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const dateFilter: any = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) dateFilter.lte = new Date(toDate);
  if (Object.keys(dateFilter).length) where.createdAt = dateFilter;

  return prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
      member: { select: { id: true, name: true } },
    },
  });
};

const getMyTasksFromDB = async (
  userId: string,
  filters: {
    status?: string;
    priority?: string;
    projectId?: string;
    search?: string;
  },
) => {
  const { status, priority, projectId, search } = filters;
  const where: any = { memberId: userId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (projectId) where.projectId = projectId;
  if (search) where.title = { contains: search, mode: "insensitive" };

  return prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
    },
  });
};

const getTaskStatsFromDB = async (userId?: string) => {
  const where = userId ? { memberId: userId } : {};
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, status: "PENDING" } }),
    prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...where, status: "COMPLETED" } }),
  ]);
  return { total, pending, inProgress, completed };
};

const getSingleTaskFromDB = async (id: string) => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      member: { select: { id: true, name: true, email: true } },
    },
  });
};

const updateTaskInDB = async (id: string, data: any) => {
  return prisma.task.update({ where: { id }, data });
};

const deleteTaskFromDB = async (id: string) => {
  return prisma.task.delete({ where: { id } });
};

export const TaskService = {
  createTaskInDB,
  getAllTasksFromDB,
  getMyTasksFromDB,
  getTaskStatsFromDB,
  getSingleTaskFromDB,
  updateTaskInDB,
  deleteTaskFromDB,
};
