import { Problem } from "../models/problem.model";

export interface ProblemUpsertInput {
  problemId: string;
  contestId: number;
  name: string;
  rating?: number;
  tags: string[];
}

export const upsertProblems = async (
  problems: ProblemUpsertInput[]
): Promise<void> => {
  if (!problems.length) {
    return;
  }

  await Problem.bulkWrite(
    problems.map((problem) => ({
      updateOne: {
        filter: { problemId: problem.problemId },
        update: { $set: problem },
        upsert: true
      }
    })),
    { ordered: false }
  );
};

export const findProblemsByIds = async (problemIds: string[]) =>
  Problem.find({ problemId: { $in: problemIds } }).sort({ contestId: -1, problemId: 1 }).lean().exec();