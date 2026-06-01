import axios from "axios";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import type { CodeforcesApiResponse, CodeforcesUser } from "../types/codeforces";

const codeforcesClient = axios.create({
  baseURL: env.codeforcesApiBaseUrl,
  timeout: env.requestTimeoutMs
});

const getCodeforcesFailureStatus = (comment?: string): number => {
  const normalized = comment?.toLowerCase() ?? "";

  if (
    normalized.includes("not found") ||
    normalized.includes("no such user") ||
    normalized.includes("user with handle")
  ) {
    return 404;
  }

  return 502;
};

export const fetchCodeforcesProfile = async (
  handle: string
): Promise<CodeforcesUser> => {
  try {
    const response = await codeforcesClient.get<
      CodeforcesApiResponse<CodeforcesUser[]>
    >("/user.info", {
      params: { handles: handle }
    });

    if (response.data.status !== "OK") {
      throw new AppError(
        getCodeforcesFailureStatus(response.data.comment),
        response.data.comment ?? "Codeforces rejected the profile request.",
        "CODEFORCES_REQUEST_FAILED"
      );
    }

    const user = response.data.result?.[0];

    if (!user) {
      throw new AppError(
        404,
        "Codeforces user was not found.",
        "CODEFORCES_USER_NOT_FOUND"
      );
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (axios.isAxiosError<CodeforcesApiResponse<unknown>>(error)) {
      const comment = error.response?.data?.comment;

      throw new AppError(
        getCodeforcesFailureStatus(comment),
        comment ?? "Unable to fetch the Codeforces profile right now.",
        "CODEFORCES_UNAVAILABLE"
      );
    }

    throw new AppError(
      502,
      "Unexpected Codeforces integration failure.",
      "CODEFORCES_UNEXPECTED_ERROR"
    );
  }
};
