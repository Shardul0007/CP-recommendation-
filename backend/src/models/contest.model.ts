import { Document, Schema, Types, model } from "mongoose";

export interface IContest extends Document {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  contestTime: Date;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema = new Schema<IContest>(
  {
    contestId: { type: Number, required: true },
    contestName: { type: String, required: true, trim: true },
    rank: { type: Number, required: true, min: 1 },
    oldRating: { type: Number, required: true, min: 0 },
    newRating: { type: Number, required: true, min: 0 },
    ratingChange: { type: Number, required: true },
    contestTime: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ContestSchema.index({ userId: 1, contestId: 1 }, { unique: true });
ContestSchema.index({ contestId: 1 });
ContestSchema.index({ userId: 1, contestTime: -1 });

export const Contest = model<IContest>("Contest", ContestSchema);