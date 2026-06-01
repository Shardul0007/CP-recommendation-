import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    handle: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 24
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    rank: { type: String, trim: true },
    maxRank: { type: String, trim: true },
    rating: { type: Number, min: 0 },
    maxRating: { type: Number, min: 0 },
    avatar: { type: String, trim: true },
    titlePhoto: { type: String, trim: true },
    lastSyncedAt: { type: Date, required: true, default: Date.now }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

UserSchema.index(
  { handle: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export const User = model<IUser>("User", UserSchema);
