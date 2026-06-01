import axios from "axios";
import { apiClient } from "./client";
import type { ApiEnvelope, ApiErrorEnvelope, UserProfile } from "../types/user";

export const importCodeforcesUser = async (
  handle: string
): Promise<ApiEnvelope<UserProfile>> => {
  const response = await apiClient.post<ApiEnvelope<UserProfile>>(
    "/users/import",
    { handle }
  );

  return response.data;
};

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
    return (
      error.response?.data?.error?.message ??
      "The backend could not import this handle."
    );
  }

  return "Something went wrong while importing this handle.";
};
