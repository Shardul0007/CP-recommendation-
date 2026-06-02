import { Router } from "express";
import {
	getUserContestsController,
	getUserProblemsController,
	getUserSubmissionsController,
	importUserController,
	syncUserController
} from "../controllers/user.controller";
import { validateBody, validateParams } from "../middleware/validate.middleware";
import { codeforcesHandleSchema } from "../validation/handle.validation";
import { importUserBodySchema } from "../validation/user.validation";
import { getUserRatingHistoryController } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.post("/import", validateBody(importUserBodySchema), importUserController);
userRouter.post("/:handle/sync", validateParams(codeforcesHandleSchema), syncUserController);
userRouter.get("/:handle/contests", validateParams(codeforcesHandleSchema), getUserContestsController);
userRouter.get("/:handle/submissions", validateParams(codeforcesHandleSchema), getUserSubmissionsController);
userRouter.get("/:handle/problems", validateParams(codeforcesHandleSchema), getUserProblemsController);
userRouter.get("/:handle/rating-history",validateParams(codeforcesHandleSchema),getUserRatingHistoryController);
