import { Document, Schema, Types, model } from "mongoose";

export interface ISubmission extends Document {
  submissionId: number;
  problemId: string;
  contestId: number;
  verdict?: string;
  programmingLanguage?: string;
  problemRating?: number;
  tags: string[];
  submissionTime: Date;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    submissionId: { type: Number, required: true },
    problemId: { type: String, required: true, trim: true },
    contestId: { type: Number, required: true },
    verdict: { type: String, trim: true },
    programmingLanguage: { type: String, trim: true },
    problemRating: { type: Number, min: 0 },
    tags: { type: [String], default: [] },
    submissionTime: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

SubmissionSchema.index({ submissionId: 1 }, { unique: true });
SubmissionSchema.index({ problemId: 1 });
SubmissionSchema.index({ contestId: 1 });
SubmissionSchema.index({ userId: 1, submissionTime: -1 });

export const Submission = model<ISubmission>("Submission", SubmissionSchema);