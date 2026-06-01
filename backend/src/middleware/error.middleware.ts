import type { ErrorRequestHandler } from "express";
import { env } from "../config/env";
import { isAppError } from "../errors/AppError";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  const statusCode = isAppError(error) ? error.statusCode : 500;
  const code = isAppError(error) ? error.code : "INTERNAL_SERVER_ERROR";
  const message = isAppError(error)
    ? error.message
    : "An unexpected error occurred.";

  response.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      statusCode,
      details: isAppError(error) ? error.details : undefined,
      stack: env.nodeEnv === "development" ? error.stack : undefined
    }
  });
};
