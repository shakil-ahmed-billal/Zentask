import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { auth } from "../lib/auth";

const authMiddleware = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: new Headers(req.headers as any),
      });

      if (!session) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      const user = session.user as any;

      if (roles.length && !roles.includes(user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authMiddleware;
