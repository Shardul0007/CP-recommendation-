const HANDLE_PATTERN = /^[A-Za-z0-9_.-]+$/;

export const validateCodeforcesHandle = (handle: string): string | null => {
  const trimmed = handle.trim();

  if (!trimmed) {
    return "Enter a Codeforces handle.";
  }

  if (trimmed.length < 3) {
    return "Codeforces handle must be at least 3 characters.";
  }

  if (trimmed.length > 24) {
    return "Codeforces handle must be at most 24 characters.";
  }

  if (!HANDLE_PATTERN.test(trimmed)) {
    return "Use only letters, numbers, underscores, dots, and hyphens.";
  }

  return null;
};
