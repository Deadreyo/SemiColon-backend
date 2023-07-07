import { Router } from "express";

import participantRouter from "./participant.router";
import userRouter from "./user.router";
import authRouter from "./auth.router";
import logRouter from "./log.router";
import { serve, setup } from "swagger-ui-express";
import swaggerDoc from "../swagger_output.json";
import { limiter } from "../middlewares/rate-limiter";

const globalRouter = Router();

// HANDLE ALL ROUTES
globalRouter.use(limiter);
globalRouter.use("/user", userRouter);
globalRouter.use("/auth", authRouter);
globalRouter.use("/participants", participantRouter);
globalRouter.use("/log", logRouter);

globalRouter.use(
  "/",
  serve,
  setup(swaggerDoc, { swaggerUrl: process.env.PORT, explorer: true })
);

export default globalRouter;
