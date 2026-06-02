export interface CodeforcesUser {
  handle: string;
  firstName?: string;
  lastName?: string;
  rank?: string;
  maxRank?: string;
  rating?: number;
  maxRating?: number;
  avatar?: string;
  titlePhoto?: string;
}

export interface CodeforcesRatingUpdate {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingUpdateTimeSeconds: number;
}

export interface CodeforcesProblem {
  contestId?: number;
  index: string;
  name: string;
  rating?: number;
  tags?: string[];
  contestName?: string;
}

export interface CodeforcesSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: CodeforcesProblem;
  programmingLanguage?: string;
  verdict?: string;
}

export interface CodeforcesProblemsetProblem {
  contestId?: number;
  index: string;
  name: string;
  rating?: number;
  tags?: string[];
}

export interface CodeforcesProblemsetResult {
  problems: CodeforcesProblemsetProblem[];
}

export interface CodeforcesApiResponse<T> {
  status: "OK" | "FAILED";
  result?: T;
  comment?: string;
}
