import { Router } from "express";
import { importUserController } from "../controllers/user.controller";
import { validateBody } from "../middleware/validate.middleware";
import { importUserBodySchema } from "../validation/user.validation";

export const userRouter = Router();

userRouter.post("/import", validateBody(importUserBodySchema), importUserController);
