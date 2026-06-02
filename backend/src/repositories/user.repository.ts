import type { IUser } from "../models/user.model";
import { User } from "../models/user.model";

const handleCollation = { locale: "en", strength: 2 };

export interface UserCreateInput {
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

export const findUserByHandle = async (
  handle: string
): Promise<IUser | null> =>
  User.findOne({ handle }).collation(handleCollation).exec();

export const upsertUserProfile = async (
  profile: UserCreateInput
): Promise<{ user: IUser; created: boolean }> => {
  const existingUser = await findUserByHandle(profile.handle);

  if (existingUser) {
    existingUser.firstName = profile.firstName;
    existingUser.lastName = profile.lastName;
    existingUser.rank = profile.rank;
    existingUser.maxRank = profile.maxRank;
    existingUser.rating = profile.rating;
    existingUser.maxRating = profile.maxRating;
    existingUser.avatar = profile.avatar;
    existingUser.titlePhoto = profile.titlePhoto;
    existingUser.lastSyncedAt = profile.lastSyncedAt;

    await existingUser.save();

    return { user: existingUser, created: false };
  }

  const user = await User.create(profile);

  return { user, created: true };
};