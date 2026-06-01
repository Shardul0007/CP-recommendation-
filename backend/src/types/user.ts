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
  lastSyncedAt: Date;
}

export interface ImportUserResult {
  user: UserProfile;
  created: boolean;
}
