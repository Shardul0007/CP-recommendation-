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
