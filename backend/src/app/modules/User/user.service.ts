import { User, UserRole, UserStatus } from "../../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const getAllUsersFromDB = async (filters: {
  role?: string;
  isVerified?: boolean;
  status?: string;
  department?: string;
  searchTerm?: string;
}) => {
  const { role, isVerified, status, department, searchTerm } = filters;

  const where: any = {};

  if (role) where.role = role as UserRole;
  if (isVerified !== undefined) where.isVerified = isVerified;
  if (status) where.status = status as UserStatus;
  if (department) where.department = department;

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  console.log("Querying users with where:", JSON.stringify(where, null, 2));
  const result = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          projects: true,
          tasks: true,
        },
      },
    },
  });
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateProfileInDB = async (id: string, data: Partial<User>) => {
  const result = await prisma.user.update({
    where: {
      id,
    },
    data,
  });
  return result;
};

export const UserService = {
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateProfileInDB,
};
