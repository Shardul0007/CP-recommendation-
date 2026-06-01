import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/user.service", () => ({
  importUserProfile: vi.fn()
}));

import app from "../src/app";
import { importUserProfile } from "../src/services/user.service";

const mockedImportUserProfile = vi.mocked(importUserProfile);

const sampleUser = {
  id: "664f0f9a0f9a0f9a0f9a0f9a",
  handle: "tourist",
  firstName: "Gennady",
  lastName: "Korotkevich",
  rank: "legendary grandmaster",
  maxRank: "legendary grandmaster",
  rating: 3857,
  maxRating: 3979,
  avatar: "https://userpic.codeforces.org/avatar.jpg",
  titlePhoto: "https://userpic.codeforces.org/title.jpg",
  lastSyncedAt: new Date("2026-01-01T00:00:00.000Z")
};

describe("POST /api/users/import", () => {
  beforeEach(() => {
    mockedImportUserProfile.mockReset();
  });

  it("imports a valid Codeforces handle", async () => {
    mockedImportUserProfile.mockResolvedValue({
      user: sampleUser,
      created: true
    });

    const response = await request(app)
      .post("/api/users/import")
      .send({ handle: "tourist" })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.handle).toBe("tourist");
    expect(response.body.meta.created).toBe(true);
    expect(mockedImportUserProfile).toHaveBeenCalledWith("tourist");
  });

  it("rejects an invalid Codeforces handle", async () => {
    const response = await request(app)
      .post("/api/users/import")
      .send({ handle: "x" })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(mockedImportUserProfile).not.toHaveBeenCalled();
  });

  it("returns an existing imported handle without creating a duplicate", async () => {
    mockedImportUserProfile.mockResolvedValue({
      user: sampleUser,
      created: false
    });

    const response = await request(app)
      .post("/api/users/import")
      .send({ handle: "tourist" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("already exists");
    expect(response.body.meta.created).toBe(false);
  });
});
