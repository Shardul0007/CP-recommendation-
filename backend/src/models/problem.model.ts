import { Document, Schema, model } from "mongoose";

export interface IProblem extends Document {
  problemId: string;
  contestId: number;
  name: string;
  rating?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    problemId: { type: String, required: true, trim: true },
    contestId: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0 },
    tags: { type: [String], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ProblemSchema.index({ problemId: 1 }, { unique: true });
ProblemSchema.index({ contestId: 1 });

export const Problem = model<IProblem>("Problem", ProblemSchema);