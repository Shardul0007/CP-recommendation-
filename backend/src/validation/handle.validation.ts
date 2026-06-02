import { z } from "zod";

export const codeforcesHandleSchema = z.object({
  handle: z
    .string({
      required_error: "Codeforces handle is required.",
      invalid_type_error: "Codeforces handle must be a string."
    })
    .trim()
    .min(3, "Codeforces handle must be at least 3 characters.")
    .max(24, "Codeforces handle must be at most 24 characters.")
    .regex(
      /^[A-Za-z0-9_.-]+$/,
      "Codeforces handle can contain letters, numbers, underscores, dots, and hyphens."
    )
});