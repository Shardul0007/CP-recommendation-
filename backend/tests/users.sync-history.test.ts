import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/sync.service", () => ({
  syncCodeforcesUser: vi.fn(),
  getContestHistoryByHandle: vi.fn(),
  getSubmissionHistoryByHandle: vi.fn(),
  getSolvedProblemsByHandle: vi.fn()
}));

import app from "../src/app";
import {
  getContestHistoryByHandle,
  getSolvedProblemsByHandle,
  getSubmissionHistoryByHandle,
  syncCodeforcesUser
} from "../src/services/sync.service";

const mockedSyncCodeforcesUser = vi.mocked(syncCodeforcesUser);
const mockedGetContestHistoryByHandle = vi.mocked(getContestHistoryByHandle);
const mockedGetSubmissionHistoryByHandle = vi.mocked(getSubmissionHistoryByHandle);
const mockedGetSolvedProblemsByHandle = vi.mocked(getSolvedProblemsByHandle);

describe("Codeforces data sync endpoints", () => {
  beforeEach(() => {
    mockedSyncCodeforcesUser.mockReset();
    mockedGetContestHistoryByHandle.mockReset();
    mockedGetSubmissionHistoryByHandle.mockReset();
    mockedGetSolvedProblemsByHandle.mockReset();
  });

  it("syncs a handle and returns ingestion metadata", async () => {
    mockedSyncCodeforcesUser.mockResolvedValue({
      user: {
        id: "664f0f9a0f9a0f9a0f9a0f9a",
        handle: "tourist",
        lastSyncedAt: new Date("2026-01-01T00:00:00.000Z")
      },
      created: true,
      contestsSynced: 12,
      submissionsSynced: 345,
      problemsSynced: 101
    });

    const response = await request(app)
      .post("/api/users/tourist/sync")
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.meta.created).toBe(true);
    expect(response.body.meta.contestsSynced).toBe(12);
    expect(mockedSyncCodeforcesUser).toHaveBeenCalledWith("tourist");
  });

  it("returns stored contest history", async () => {
    mockedGetContestHistoryByHandle.mockResolvedValue([
      {
        contestId: 1234,
        contestName: "Codeforces Round",
        rank: 42,
        oldRating: 2100,
        newRating: 2200,
        ratingChange: 100,
        contestTime: new Date("2026-01-01T00:00:00.000Z")
      }
    ]);

    const response = await request(app)
      .get("/api/users/tourist/contests")
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.count).toBe(1);
    expect(mockedGetContestHistoryByHandle).toHaveBeenCalledWith("tourist");
  });

  it("returns stored submission history", async () => {
    mockedGetSubmissionHistoryByHandle.mockResolvedValue([
      {
        submissionId: 99,
        problemId: "1234-A",
        contestId: 1234,
        verdict: "OK",
        programmingLanguage: "GNU C++17",
        problemRating: 1200,
        tags: ["math"],
        submissionTime: new Date("2026-01-01T00:00:00.000Z")
      }
    ]);

    const response = await request(app)
      .get("/api/users/tourist/submissions")
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.count).toBe(1);
    expect(mockedGetSubmissionHistoryByHandle).toHaveBeenCalledWith("tourist");
  });

  it("returns solved problems", async () => {
    mockedGetSolvedProblemsByHandle.mockResolvedValue([
      {
        problemId: "1234-A",
        contestId: 1234,
        name: "Problem A",
        rating: 1200,
        tags: ["math", "greedy"]
      }
    ]);

    const response = await request(app)
      .get("/api/users/tourist/problems")
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.count).toBe(1);
    expect(mockedGetSolvedProblemsByHandle).toHaveBeenCalledWith("tourist");
  });
});