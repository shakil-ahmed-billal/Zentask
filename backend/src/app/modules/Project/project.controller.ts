import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { CloudinaryHelper } from "../../utils/cloudinary";
import sendResponse from "../../utils/sendResponse";
import { ProjectService } from "./project.service";

const createProject = catchAsync(async (req: Request, res: Response) => {
  let projectPhotoURL = req.body.projectPhotoURL; // fall back to existing link if provided

  if (req.file) {
    projectPhotoURL = await CloudinaryHelper.uploadImage(req.file.buffer);
  }

  try {
    const { deliveryValue, progress, ...rest } = req.body;
    const projectData = {
      ...rest,
      ...(deliveryValue !== undefined && {
        deliveryValue: Number(deliveryValue),
      }),
      ...(progress !== undefined && { progress: Number(progress) }),
    };

    const result = await ProjectService.createProjectInDB({
      ...projectData,
      leaderId: req.user?.id,
      ...(projectPhotoURL && { projectPhotoURL }),
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Project created successfully",
      data: result,
    });
  } catch (error) {
    if (projectPhotoURL) {
      await CloudinaryHelper.deleteImage(projectPhotoURL);
    }
    throw error;
  }
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectService.getAllProjectsFromDB(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Projects fetched successfully",
    data: result,
  });
});

const getMyProjects = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectService.getMemberProjectsFromDB(
    req.user?.id as string,
    req.query as any,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your projects fetched successfully",
    data: result,
  });
});

const getSingleProject = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectService.getSingleProjectFromDB(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project fetched successfully",
    data: result,
  });
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // Check if user is leader or member of the project
  const project = await ProjectService.getSingleProjectFromDB(id as string);
  if (!project) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Project not found",
      data: null,
    });
  }

  const isLeader = project.leaderId === userId;
  const isMember = project.members.some((m: any) => m.userId === userId);

  if (!isLeader && !isMember) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "You are not authorized to update this project",
      data: null,
    });
  }

  let projectPhotoURL = req.body.projectPhotoURL;

  if (req.file) {
    projectPhotoURL = await CloudinaryHelper.uploadImage(req.file.buffer);
    if (project.projectPhotoURL) {
      // Background deletion of old image
      CloudinaryHelper.deleteImage(project.projectPhotoURL).catch(
        console.error,
      );
    }
  }

  const { deliveryValue, progress, ...rest } = req.body;
  const updatePayload = {
    ...rest,
    ...(deliveryValue !== undefined && {
      deliveryValue: Number(deliveryValue),
    }),
    ...(progress !== undefined && { progress: Number(progress) }),
    ...(projectPhotoURL && { projectPhotoURL }),
  };

  const result = await ProjectService.updateProjectInDB(
    id as string,
    updatePayload,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project updated successfully",
    data: result,
  });
});

const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectService.deleteProjectFromDB(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project deleted successfully",
    data: result,
  });
});

const assignMember = catchAsync(async (req: Request, res: Response) => {
  const { projectId, userId } = req.body;
  const result = await ProjectService.assignMemberToProjectInDB(
    projectId as string,
    userId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Member assigned successfully",
    data: result,
  });
});

const removeMember = catchAsync(async (req: Request, res: Response) => {
  const { projectId, userId } = req.body;
  const result = await ProjectService.removeMemberFromProjectInDB(
    projectId as string,
    userId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Member removed successfully",
    data: result,
  });
});

export const ProjectController = {
  createProject,
  getAllProjects,
  getMyProjects,
  getSingleProject,
  updateProject,
  deleteProject,
  assignMember,
  removeMember,
};
