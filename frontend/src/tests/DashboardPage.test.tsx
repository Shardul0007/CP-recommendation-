import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import type { UserProfile } from "../types/user";

const sampleUser: UserProfile = {
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
  lastSyncedAt: "2026-01-01T00:00:00.000Z"
};

describe("DashboardPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the imported Codeforces profile", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/dashboard",
            state: { user: sampleUser, imported: true }
          }
        ]}
      >
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "tourist" })).toBeInTheDocument();
    expect(screen.getByText("Gennady Korotkevich")).toBeInTheDocument();
    expect(screen.getAllByText("legendary grandmaster")).toHaveLength(2);
    expect(screen.getByText("3857")).toBeInTheDocument();
    expect(screen.getByText("3979")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "tourist avatar" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Profile imported successfully."
    );
  });
});
