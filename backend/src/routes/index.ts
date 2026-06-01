import { Router } from "express";
import { userRouter } from "./user.routes";

export const apiRouter = Router();

apiRouter.use("/users", userRouter);
