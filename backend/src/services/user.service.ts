import { AppError } from "../errors/AppError";
import { User, type IUser } from "../models/user.model";
import { fetchCodeforcesProfile } from "./codeforces.service";
import type { ImportUserResult, UserProfile } from "../types/user";

const handleCollation = { locale: "en", strength: 2 };

const toUserProfile = (user: IUser): UserProfile => ({
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

export const importUserProfile = async (
  rawHandle: string
): Promise<ImportUserResult> => {
  const handle = rawHandle.trim();

  const existingUser = await User.findOne({ handle })
    .collation(handleCollation)
    .exec();

  if (existingUser) {
    return {
      user: toUserProfile(existingUser),
      created: false
    };
  }

  const codeforcesUser = await fetchCodeforcesProfile(handle);

  try {
    const user = await User.create({
      handle: codeforcesUser.handle,
      firstName: codeforcesUser.firstName,
      lastName: codeforcesUser.lastName,
      rank: codeforcesUser.rank,
      maxRank: codeforcesUser.maxRank,
      rating: codeforcesUser.rating,
      maxRating: codeforcesUser.maxRating,
      avatar: codeforcesUser.avatar,
      titlePhoto: codeforcesUser.titlePhoto,
      lastSyncedAt: new Date()
    });

    return {
      user: toUserProfile(user),
      created: true
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      const existingAfterRace = await User.findOne({
        handle: codeforcesUser.handle
      })
        .collation(handleCollation)
        .exec();

      if (existingAfterRace) {
        return {
          user: toUserProfile(existingAfterRace),
          created: false
        };
      }
    }

    throw new AppError(
      500,
      "Unable to store the imported user profile.",
      "USER_IMPORT_PERSISTENCE_FAILED"
    );
  }
};
