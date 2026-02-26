import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import { auth } from "./app/lib/auth";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";

const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Better Auth - must be mounted before other middleware and at app level
// so it receives the full URL path (not Express-stripped path)
app.all("/api/auth/*splat", toNodeHandler(auth));
app.all("/api/v1/auth/*splat", toNodeHandler(auth));

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "WorkSphere Server is running...",
  });
});

// global error handler
app.use(globalErrorHandler);

// handle not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Not Found",
      },
    ],
  });
});

export default app;
