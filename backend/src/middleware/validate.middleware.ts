import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../errors/AppError";

export const validateBody =
  (schema: ZodSchema) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(
        new AppError(
          400,
          "Validation failed.",
          "VALIDATION_ERROR",
          result.error.flatten()
        )
      );
      return;
    }

    request.body = result.data;
    next();
  };

export const validateParams =
  (schema: ZodSchema) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request.params);

    if (!result.success) {
      next(
        new AppError(
          400,
          "Validation failed.",
          "VALIDATION_ERROR",
          result.error.flatten()
        )
      );
      return;
    }

    request.params = result.data as Request["params"];
    next();
  };
