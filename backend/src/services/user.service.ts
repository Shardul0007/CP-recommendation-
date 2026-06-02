import type { ImportUserResult } from "../types/user";
import { syncCodeforcesUser } from "./sync.service";

export const importUserProfile = async (
  rawHandle: string
): Promise<ImportUserResult> => {
  const result = await syncCodeforcesUser(rawHandle);

  return {
    user: result.user,
    created: result.created
  };
};
