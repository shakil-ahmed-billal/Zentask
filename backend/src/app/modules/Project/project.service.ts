import { prisma } from "../../lib/prisma";

const createProjectInDB = async (data: any) => {
  const formattedData = { ...data };
  if (formattedData.startDate)
    formattedData.startDate = new Date(formattedData.startDate);
  if (formattedData.deadline)
    formattedData.deadline = new Date(formattedData.deadline);
  return prisma.project.create({ data: formattedData });
};

const getAllProjectsFromDB = async (filters: {
  status?: string;
  search?: string;
  memberId?: string;
  leaderId?: string;
  fromDate?: string;
  toDate?: string;
  month?: string;
  year?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
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
    sortOrder = "desc",
  } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (leaderId) where.leaderId = leaderId;
  if (memberId) where.members = { some: { userId: memberId } };
  if (search) where.title = { contains: search, mode: "insensitive" };

  const dateFilter: any = {};
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
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      tasks: { select: { id: true, status: true } },
    },
  });
};

const getMemberProjectsFromDB = async (
  userId: string,
  filters?: {
    status?: string;
    search?: string;
    month?: string;
    year?: string;
    sortBy?: string;
    sortOrder?: string;
  },
) => {
  const where: any = {
    OR: [{ leaderId: userId }, { members: { some: { userId } } }],
  };

  if (filters) {
    const { status, search, month, year } = filters;
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const dateFilter: any = {};
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
  const orderByField =
    sortBy && validSortFields.includes(sortBy) ? sortBy : "createdAt";

  return prisma.project.findMany({
    where,
    orderBy: { [orderByField]: sortOrder === "asc" ? "asc" : "desc" },
    include: {
      leader: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
      tasks: { where: { memberId: userId } },
    },
  });
};

const getSingleProjectFromDB = async (id: string) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      leader: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      tasks: { include: { member: { select: { id: true, name: true } } } },
    },
  });
};

const updateProjectInDB = async (id: string, data: any) => {
  const formattedData = { ...data };
  if (formattedData.startDate)
    formattedData.startDate = new Date(formattedData.startDate);
  if (formattedData.deadline)
    formattedData.deadline = new Date(formattedData.deadline);
  return prisma.project.update({ where: { id }, data: formattedData });
};

const deleteProjectFromDB = async (id: string) => {
  // Delete related records first
  await prisma.task.deleteMany({ where: { projectId: id } });
  await prisma.memberProject.deleteMany({ where: { projectId: id } });
  return prisma.project.delete({ where: { id } });
};

const assignMemberToProjectInDB = async (projectId: string, userId: string) => {
  return prisma.memberProject.upsert({
    where: { userId_projectId: { userId, projectId } },
    create: { projectId, userId },
    update: {},
  });
};

const removeMemberFromProjectInDB = async (
  projectId: string,
  userId: string,
) => {
  return prisma.memberProject.delete({
    where: { userId_projectId: { userId, projectId } },
  });
};

export const ProjectService = {
  createProjectInDB,
  getAllProjectsFromDB,
  getMemberProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectInDB,
  deleteProjectFromDB,
  assignMemberToProjectInDB,
  removeMemberFromProjectInDB,
};
