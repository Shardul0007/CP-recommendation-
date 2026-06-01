import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError";

export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      404,
      `Route ${request.method} ${request.originalUrl} was not found.`,
      "ROUTE_NOT_FOUND"
    )
  );
};
