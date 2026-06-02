import { AppError } from "../errors/AppError";
import { Problem } from "../models/problem.model";
import { Contest } from "../models/contest.model";
import { Submission } from "../models/submission.model";
import {
  findContestsByUserHandle,
  upsertContests
} from "../repositories/contest.repository";

import {
  findSubmissionsByUserId,
  findAcceptedProblemIdsByUserId,
  upsertSubmissions
} from "../repositories/submission.repository";

import {
  findProblemsByIds,
  upsertProblems
} from "../repositories/problem.repository";

import {
  findUserByHandle,
  upsertUserProfile
} from "../repositories/user.repository";
import { fetchCodeforcesProblemset, fetchCodeforcesProfile, fetchCodeforcesRatingHistory, fetchCodeforcesSubmissions } from "./codeforces.service";
import type { CodeforcesProblem, CodeforcesProblemsetProblem, CodeforcesRatingUpdate, CodeforcesSubmission } from "../types/codeforces";
import type { UserProfile } from "../types/user";
console.log("SYNC SERVICE VERSION 2 LOADED");
const handleCollation = { locale: "en", strength: 2 };

export interface SyncResult {
  user: UserProfile;
  created: boolean;
  contestsSynced: number;
  submissionsSynced: number;
  problemsSynced: number;
}

export interface ProblemView {
  problemId: string;
  contestId: number;
  name: string;
  rating?: number;
  tags: string[];
}

export interface ContestView {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  contestTime: Date;
}

export interface SubmissionView {
  submissionId: number;
  problemId: string;
  problemName: string;
  contestId: number;
  verdict?: string;
  programmingLanguage?: string;
  problemRating?: number;
  tags: string[];
  submissionTime: Date;
}

const toUserProfile = (user: { id: string; handle: string; firstName?: string; lastName?: string; rank?: string; maxRank?: string; rating?: number; maxRating?: number; avatar?: string; titlePhoto?: string; lastSyncedAt: Date; }): UserProfile => ({
  id: user.id,
  handle: user.handle,
  firstName: user.firstName,
  lastName: user.lastName,
  rank: user.rank,
  maxRank: user.maxRank,
  rating: user.rating,
  maxRating: user.maxRating,
  avatar: user.avatar,
  titlePhoto: user.titlePhoto,
  lastSyncedAt: user.lastSyncedAt
});

const buildProblemId = (problem: CodeforcesProblem | CodeforcesProblemsetProblem): string =>
  `${problem.contestId ?? 0}-${problem.index}`;

const getProblemMetadata = (
  submissionProblem: CodeforcesProblem,
  problemsetLookup: Map<string, CodeforcesProblemsetProblem>
): ProblemView => {
  const problemId = buildProblemId(submissionProblem);
  const problemsetProblem = problemsetLookup.get(problemId);

  return {
    problemId,
    contestId: submissionProblem.contestId ?? problemsetProblem?.contestId ?? 0,
    name: submissionProblem.name || problemsetProblem?.name || problemId,
    rating: submissionProblem.rating ?? problemsetProblem?.rating,
    tags: submissionProblem.tags ?? problemsetProblem?.tags ?? []
  };
};

export const syncCodeforcesUser = async (rawHandle: string): Promise<SyncResult> => {
  const handle = rawHandle.trim();

  const profile = await fetchCodeforcesProfile(handle);
  const { user, created } = await upsertUserProfile({
    handle: profile.handle,
    firstName: profile.firstName,
    lastName: profile.lastName,
    rank: profile.rank,
    maxRank: profile.maxRank,
    rating: profile.rating,
    maxRating: profile.maxRating,
    avatar: profile.avatar,
    titlePhoto: profile.titlePhoto,
    lastSyncedAt: new Date()
  });

  const [ratingHistory, submissions, problemset] = await Promise.all([
    fetchCodeforcesRatingHistory(handle),
    fetchCodeforcesSubmissions(handle),
    fetchCodeforcesProblemset()
  ]);

  const problemsetLookup = new Map(
    problemset.problems.map((problem) => [buildProblemId(problem), problem])
  );

  const contestDocuments = ratingHistory.map((update: CodeforcesRatingUpdate) => ({
    contestId: update.contestId,
    contestName: update.contestName,
    rank: update.rank,
    oldRating: update.oldRating,
    newRating: update.newRating,
    ratingChange: update.newRating - update.oldRating,
    contestTime: new Date(update.ratingUpdateTimeSeconds * 1000),
    userId: user.id
  }));

  const submissionDocuments = submissions.map((submission: CodeforcesSubmission) => {
    const metadata = getProblemMetadata(submission.problem, problemsetLookup);

    return {
      submissionId: submission.id,
      problemId: metadata.problemId,
      contestId: metadata.contestId,
      verdict: submission.verdict,
      programmingLanguage: submission.programmingLanguage,
      problemRating: metadata.rating,
      tags: metadata.tags,
      submissionTime: new Date(submission.creationTimeSeconds * 1000),
      userId: user.id
    };
  });

  const problemDocuments = new Map<string, ProblemView>();

  for (const submission of submissions) {
    const metadata = getProblemMetadata(submission.problem, problemsetLookup);
    problemDocuments.set(metadata.problemId, metadata);
  }

  await Promise.all([
    upsertContests(contestDocuments),
    upsertSubmissions(submissionDocuments),
    upsertProblems(Array.from(problemDocuments.values()))
  ]);

  return {
    user: toUserProfile(user),
    created,
    contestsSynced: contestDocuments.length,
    submissionsSynced: submissionDocuments.length,
    problemsSynced: problemDocuments.size
  };
};

export const getContestHistoryByHandle = async (rawHandle: string): Promise<ContestView[]> => {
  const user = await findUserByHandle(rawHandle.trim());
  console.log("user", user);
  
  if (!user) {
    throw new AppError(404, "Codeforces profile not found locally.", "USER_NOT_IMPORTED");
  }
  const contests = await findContestsByUserHandle(user.id);

console.log("contests", contests);

  return findContestsByUserHandle(user.id);
};

export const getSubmissionHistoryByHandle = async (rawHandle: string): Promise<SubmissionView[]> => {
  const user = await findUserByHandle(rawHandle.trim());

  if (!user) {
    throw new AppError(404, "Codeforces profile not found locally.", "USER_NOT_IMPORTED");
  }

  const submissions = await findSubmissionsByUserId(user.id);
  const problemIds = [...new Set(submissions.map((submission) => submission.problemId))];
  const problems = await findProblemsByIds(problemIds);
  const problemLookup = new Map(problems.map((problem) => [problem.problemId, problem]));

  return submissions.map((submission) => ({
    submissionId: submission.submissionId,
    problemId: submission.problemId,
    problemName: problemLookup.get(submission.problemId)?.name ?? submission.problemId,
    contestId: submission.contestId,
    verdict: submission.verdict,
    programmingLanguage: submission.programmingLanguage,
    problemRating: submission.problemRating,
    tags: submission.tags,
    submissionTime: submission.submissionTime
  }));
};

export const getSolvedProblemsByHandle = async (rawHandle: string): Promise<ProblemView[]> => {
  const user = await findUserByHandle(rawHandle.trim());

  if (!user) {
    throw new AppError(404, "Codeforces profile not found locally.", "USER_NOT_IMPORTED");
  }

  const acceptedProblemIds = await findAcceptedProblemIdsByUserId(user.id);

  if (!acceptedProblemIds.length) {
    return [];
  }

  return findProblemsByIds(acceptedProblemIds);
};

export interface RatingHistoryItem {
  contestId: number;
  contestName: string;
  contestTime: Date;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
}

export const getRatingHistoryByHandle = async (
  rawHandle: string
): Promise<RatingHistoryItem[]> => {
  const contests = await getContestHistoryByHandle(rawHandle);

  return contests.map((contest) => ({
    contestId: contest.contestId,
    contestName: contest.contestName,
    contestTime: contest.contestTime,
    rank: contest.rank,
    oldRating: contest.oldRating,
    newRating: contest.newRating,
    ratingChange: contest.ratingChange
  }));
};