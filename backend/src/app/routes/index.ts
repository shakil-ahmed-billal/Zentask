import express from "express";
import { AnalyticsRoutes } from "../modules/Analytics/analytics.route";
import { ProjectRoutes } from "../modules/Project/project.route";
import { TaskRoutes } from "../modules/Task/task.route";
import { UserRoutes } from "../modules/User/user.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/projects",
    route: ProjectRoutes,
  },
  {
    path: "/tasks",
    route: TaskRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
