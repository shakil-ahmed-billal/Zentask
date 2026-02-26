import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "../../lib/auth";

const router = express.Router();

// Mount all Better Auth handlers under /api/v1/auth/*
router.all("/*splat", toNodeHandler(auth));

export const AuthRoutes = router;
