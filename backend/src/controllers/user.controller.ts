import { asyncHandler } from "../utils/asyncHandler";
import { importUserProfile } from "../services/user.service";

export const importUserController = asyncHandler(async (request, response) => {
  const result = await importUserProfile(request.body.handle);

  response.status(result.created ? 201 : 200).json({
    success: true,
    message: result.created
      ? "Codeforces profile imported successfully."
      : "Codeforces profile already exists.",
    data: result.user,
    meta: {
      created: result.created
    }
  });
});
