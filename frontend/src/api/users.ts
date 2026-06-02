import axios from "axios";
import { apiClient } from "./client";
import type {
  ApiEnvelope,
  ApiErrorEnvelope,
  ContestHistoryItem,
  ProblemHistoryItem,
  RatingHistoryItem,
  SubmissionHistoryItem,
  UserProfile
} from "../types/user";

export const importCodeforcesUser = async (
  handle: string
): Promise<ApiEnvelope<UserProfile>> => {
  const response = await apiClient.post<ApiEnvelope<UserProfile>>(
    `/users/${encodeURIComponent(handle)}/sync`
  );

  return response.data;
};

export const syncCodeforcesUser = async (
  handle: string
): Promise<ApiEnvelope<UserProfile>> => {
  const response = await apiClient.post<ApiEnvelope<UserProfile>>(
    `/users/${encodeURIComponent(handle)}/sync`
  );

  return response.data;
};

export const getUserContests = async (
  handle: string
): Promise<ApiEnvelope<ContestHistoryItem[]>> => {
  const response = await apiClient.get<ApiEnvelope<ContestHistoryItem[]>>(
    `/users/${encodeURIComponent(handle)}/contests`
  );

  return response.data;
};

export const getUserSubmissions = async (
  handle: string
): Promise<ApiEnvelope<SubmissionHistoryItem[]>> => {
  const response = await apiClient.get<ApiEnvelope<SubmissionHistoryItem[]>>(
    `/users/${encodeURIComponent(handle)}/submissions`
  );

  return response.data;
};

export const getUserProblems = async (
  handle: string
): Promise<ApiEnvelope<ProblemHistoryItem[]>> => {
  const response = await apiClient.get<ApiEnvelope<ProblemHistoryItem[]>>(
    `/users/${encodeURIComponent(handle)}/problems`
  );

  return response.data;
};

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
    return (
      error.response?.data?.error?.message ??
      "The backend could not complete this request."
    );
  }

  return "Something went wrong while syncing this handle.";
};

export const getUserRatingHistory = async (
  handle: string
): Promise<ApiEnvelope<RatingHistoryItem[]>> => {
  const response = await apiClient.get<
    ApiEnvelope<RatingHistoryItem[]>
  >(
    `/users/${encodeURIComponent(handle)}/rating-history`
  );

  return response.data;
};