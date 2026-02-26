import { UserRole } from "@prisma/client";
import express from "express";
import authMiddleware from "../../middlewares/auth";
import { UserController } from "./user.controller";

const router = express.Router();

router.get("/", UserController.getAllUsers);
router.get("/leaders", UserController.getAllLeaders);
router.get("/:id", UserController.getSingleUser);
router.patch("/:id", UserController.updateProfile);

router.post(
  "/verify/:id",
  authMiddleware(UserRole.LEADER),
  UserController.verifyUser,
);

router.post(
  "/suspend/:id",
  authMiddleware(UserRole.LEADER),
  UserController.suspendUser,
);

export const UserRoutes = router;
