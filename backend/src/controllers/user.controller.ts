import { asyncHandler } from "../utils/asyncHandler";
import { importUserProfile } from "../services/user.service";
import {
  getContestHistoryByHandle,
  getRatingHistoryByHandle,
  getSolvedProblemsByHandle,
  getSubmissionHistoryByHandle,
  syncCodeforcesUser
} from "../services/sync.service";

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

export const syncUserController = asyncHandler(async (request, response) => {
  const result = await syncCodeforcesUser(request.params.handle);

  response.status(result.created ? 201 : 200).json({
    success: true,
    message: result.created
      ? "Codeforces profile synchronized successfully."
      : "Codeforces profile synchronized successfully.",
    data: result.user,
    meta: {
      created: result.created,
      contestsSynced: result.contestsSynced,
      submissionsSynced: result.submissionsSynced,
      problemsSynced: result.problemsSynced
    }
  });
});

export const getUserContestsController = async (req, res) => {
  try {
    console.log("START");

    const contests = await getContestHistoryByHandle(req.params.handle);

    console.log("CONTESTS", contests);

    res.status(200).json({
      success: true,
      data: contests
    });
  } catch (err) {
    console.error("ACTUAL ERROR:", err);
    res.status(500).json(err);
  }
};

export const getUserSubmissionsController = asyncHandler(async (request, response) => {
  const submissions = await getSubmissionHistoryByHandle(request.params.handle);

  response.status(200).json({
    success: true,
    data: submissions,
    meta: {
      count: submissions.length
    }
  });
});

export const getUserProblemsController = asyncHandler(async (request, response) => {
  const problems = await getSolvedProblemsByHandle(request.params.handle);

  response.status(200).json({
    success: true,
    data: problems,
    meta: {
      count: problems.length
    }
  });
});

export const getUserRatingHistoryController = asyncHandler(
  async (request, response) => {
    const history = await getRatingHistoryByHandle(
      request.params.handle
    );

    response.status(200).json({
      success: true,
      data: history,
      meta: {
        count: history.length
      }
    });
  }
);