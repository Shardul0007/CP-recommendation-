import { Types } from "mongoose";
import { Contest } from "../models/contest.model";

export interface ContestUpsertInput {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  contestTime: Date;
  userId: string;
}

const toObjectId = (value: string | Types.ObjectId): Types.ObjectId =>
  typeof value === "string" ? new Types.ObjectId(value) : value;

export const upsertContests = async (
  contests: ContestUpsertInput[]
): Promise<void> => {
  if (!contests.length) {
    return;
  }

  await Contest.bulkWrite(
    contests.map((contest) => ({
      updateOne: {
        filter: {
          userId: toObjectId(contest.userId),
          contestId: contest.contestId
        },
        update: {
          $set: {
            ...contest,
            userId: toObjectId(contest.userId)
          }
        },
        upsert: true
      }
    })),
    { ordered: false }
  );
};

export const findContestsByUserHandle = async (userId: string) =>
  Contest.find({ userId }).sort({ contestTime: -1, contestId: -1 }).lean().exec();