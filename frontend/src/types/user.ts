export interface UserProfile {
  id: string;
  handle: string;
  firstName?: string;
  lastName?: string;
  rank?: string;
  maxRank?: string;
  rating?: number;
  maxRating?: number;
  avatar?: string;
  titlePhoto?: string;
  lastSyncedAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    created?: boolean;
    [key: string]: unknown;
  };
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

export interface ContestHistoryItem {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  contestTime: string;
}

export interface SubmissionHistoryItem {
  submissionId: number;
  problemId: string;
  problemName: string;
  contestId: number;
  verdict?: string;
  programmingLanguage?: string;
  problemRating?: number;
  tags: string[];
  submissionTime: string;
}

export interface ProblemHistoryItem {
  problemId: string;
  contestId: number;
  name: string;
  rating?: number;
  tags: string[];
}
