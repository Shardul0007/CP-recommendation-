import { Types } from "mongoose";
import { Submission } from "../models/submission.model";

export interface SubmissionUpsertInput {
  submissionId: number;
  problemId: string;
  contestId: number;
  verdict?: string;
  programmingLanguage?: string;
  problemRating?: number;
  tags: string[];
  submissionTime: Date;
  userId: string;
}

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

export const upsertSubmissions = async (
  submissions: SubmissionUpsertInput[]
): Promise<void> => {
  if (!submissions.length) {
    return;
  }

  await Submission.bulkWrite(
    submissions.map((submission) => ({
      updateOne: {
        filter: { submissionId: submission.submissionId },
        update: {
          $set: {
            ...submission,
            userId: toObjectId(submission.userId)
          }
        },
        upsert: true
      }
    })),
    { ordered: false }
  );
};

export const findSubmissionsByUserId = async (userId: string) =>
  Submission.find({ userId }).sort({ submissionTime: -1, submissionId: -1 }).lean().exec();

export const findAcceptedProblemIdsByUserId = async (userId: string) => {
  const acceptedSubmissions = await Submission.find({ userId, verdict: "OK" })
    .select({ problemId: 1, _id: 0 })
    .lean()
    .exec();

  return [...new Set(acceptedSubmissions.map((submission) => submission.problemId))];
};