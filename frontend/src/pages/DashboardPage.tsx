import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  getUserContests,
  getUserProblems,
  getUserSubmissions,
  getUserRatingHistory,
  getApiErrorMessage
} from "../api/users";
import MetricCard from "../components/MetricCard";
import type {
  ContestHistoryItem,
  ProblemHistoryItem,
  RatingHistoryItem,
  SubmissionHistoryItem,
  UserProfile
} from "../types/user";

const STORAGE_KEY = "cp-recommendation:last-imported-user";

type DashboardTab = "profile" | "contests" | "submissions" | "problems" | "rating-history";

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "contests", label: "Contests" },
  { id: "submissions", label: "Submissions" },
  { id: "problems", label: "Problems" },
  { id: "rating-history", label: "Rating History" }
];

interface DashboardLocationState {
  user?: UserProfile;
  imported?: boolean;
}

const readStoredUser = (): UserProfile | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as UserProfile;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const formatValue = (value: string | number | undefined): string | number =>
  value ?? "Not rated";

const formatContestChange = (value: number): string =>
  value > 0 ? `+${value}` : `${value}`;

const formatProblemTags = (tags: string[]): string =>
  tags.length ? tags.join(", ") : "No tags";

const DashboardPage = () => {
  const location = useLocation();
  const routeState = location.state as DashboardLocationState | null;
  const [user] = useState<UserProfile | null>(
    () => routeState?.user ?? readStoredUser()
  );
  const [activeTab, setActiveTab] = useState<DashboardTab>("profile");
  const [contests, setContests] = useState<ContestHistoryItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [problems, setProblems] = useState<ProblemHistoryItem[]>([]);
  const [ratingHistory, setRatingHistory] = useState<RatingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fullName = useMemo(() => {
    if (!user) {
      return "";
    }

    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadHistory = async (): Promise<void> => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const [contestResponse, submissionResponse, problemResponse, ratingResponse] =
          await Promise.all([
            getUserContests(user.handle),
            getUserSubmissions(user.handle),
            getUserProblems(user.handle),
            getUserRatingHistory(user.handle)
          ]);

        if (cancelled) {
          return;
        }

        setContests(contestResponse.data);
        setSubmissions(submissionResponse.data);
        setProblems(problemResponse.data);
        setRatingHistory(ratingResponse.data);
      } catch (error) {
        if (!cancelled) {
          setHistoryError(getApiErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mist px-5">
        <section className="w-full max-w-lg rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-ink">No profile loaded</h1>
          <p className="mt-3 text-ink/70">
            Import a Codeforces handle first to open the dashboard.
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-pine px-5 font-semibold text-white"
            to="/"
          >
            Import profile
          </Link>
        </section>
      </main>
    );
  }

  const profileImage = user.titlePhoto ?? user.avatar;

  const renderContestTable = () =>
    contests.length ? (
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-ink/10 text-left text-sm">
          <thead className="bg-mist/70 text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Contest Name</th>
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">Rating Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {contests.map((contest) => (
              <tr key={`${contest.contestId}-${contest.contestTime}`}>
                <td className="px-4 py-3 text-ink">{contest.contestName}</td>
                <td className="px-4 py-3 text-ink/80">{contest.rank}</td>
                <td className="px-4 py-3 font-semibold text-pine">
                  {formatContestChange(contest.ratingChange)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="rounded-lg border border-ink/10 bg-white px-4 py-6 text-sm text-ink/70 shadow-soft">
        No contest history stored yet.
      </p>
    );

  const renderSubmissionTable = () =>
    submissions.length ? (
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-ink/10 text-left text-sm">
          <thead className="bg-mist/70 text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Problem</th>
              <th className="px-4 py-3 font-semibold">Verdict</th>
              <th className="px-4 py-3 font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {submissions.map((submission) => (
              <tr key={submission.submissionId}>
                <td className="px-4 py-3 text-ink">
                  {submission.problemName}
                </td>
                <td className="px-4 py-3 text-ink/80">
                  {submission.verdict ?? "Unknown"}
                </td>
                <td className="px-4 py-3 text-ink/80">
                  {submission.problemRating ?? "Not rated"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="rounded-lg border border-ink/10 bg-white px-4 py-6 text-sm text-ink/70 shadow-soft">
        No submission history stored yet.
      </p>
    );

    const renderRatingHistoryTable = () =>
  ratingHistory.length ? (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <table className="min-w-full divide-y divide-ink/10 text-left text-sm">
        <thead className="bg-mist/70 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Contest</th>
            <th className="px-4 py-3 font-semibold">Rank</th>
            <th className="px-4 py-3 font-semibold">Old Rating</th>
            <th className="px-4 py-3 font-semibold">New Rating</th>
            <th className="px-4 py-3 font-semibold">Change</th>
            <th className="px-4 py-3 font-semibold">Date</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-ink/10">
          {ratingHistory.map((contest) => (
            <tr key={contest.contestId}>
              <td className="px-4 py-3 text-ink">
                {contest.contestName}
              </td>

              <td className="px-4 py-3 text-ink/80">
                {contest.rank}
              </td>

              <td className="px-4 py-3 text-ink/80">
                {contest.oldRating}
              </td>

              <td className="px-4 py-3 text-ink/80">
                {contest.newRating}
              </td>

              <td
                className={`px-4 py-3 font-medium ${
                  contest.ratingChange > 0
                    ? "text-green-600"
                    : contest.ratingChange < 0
                    ? "text-red-600"
                    : "text-ink/80"
                }`}
              >
                {contest.ratingChange > 0
                  ? `+${contest.ratingChange}`
                  : contest.ratingChange}
              </td>

              <td className="px-4 py-3 text-ink/80">
                {new Date(contest.contestTime).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="rounded-lg border border-ink/10 bg-white px-4 py-6 text-sm text-ink/70 shadow-soft">
      No rating history stored yet.
    </p>
  );
  
  const renderProblemTable = () =>
    problems.length ? (
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <table className="min-w-full divide-y divide-ink/10 text-left text-sm">
          <thead className="bg-mist/70 text-ink/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Problem Name</th>
              <th className="px-4 py-3 font-semibold">Rating</th>
              <th className="px-4 py-3 font-semibold">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {problems.map((problem) => (
              <tr key={problem.problemId}>
                <td className="px-4 py-3 text-ink">{problem.name}</td>
                <td className="px-4 py-3 text-ink/80">
                  {problem.rating ?? "Not rated"}
                </td>
                <td className="px-4 py-3 text-ink/80">
                  {formatProblemTags(problem.tags)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="rounded-lg border border-ink/10 bg-white px-4 py-6 text-sm text-ink/70 shadow-soft">
        No solved problems stored yet.
      </p>
    );

  return (
    <main className="min-h-screen bg-mist">
      <section className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pine">
              Codeforces dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-ink sm:text-4xl">
              {user.handle}
            </h1>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 font-semibold text-ink transition hover:border-pine hover:text-pine"
            to="/"
          >
            Import another
          </Link>
        </div>

        {routeState?.imported ? (
          <p
            className="mt-6 rounded-lg border border-pine/30 bg-pine/10 px-4 py-3 text-sm font-medium text-pine"
            role="status"
          >
            Profile imported successfully.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-pine bg-pine text-white"
                  : "border-ink/15 bg-white text-ink hover:border-pine hover:text-pine"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(historyError || historyLoading) && activeTab !== "profile" ? (
          <div className="mt-5">
            {historyLoading ? (
              <p className="rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm text-ink/70 shadow-soft">
                Loading stored history...
              </p>
            ) : null}
            {historyError ? (
              <p className="mt-3 rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-coral">
                {historyError}
              </p>
            ) : null}
          </div>
        ) : null}

        {activeTab === "profile" ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[340px_1fr]">
            <aside className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <img
                className="aspect-square w-full rounded-lg object-cover"
                src={profileImage}
                alt={`${user.handle} avatar`}
              />
              <div className="mt-5">
                <p className="text-sm font-medium text-ink/60">Name</p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {fullName || "Name not available"}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-ink/60">Last synced</p>
                <p className="mt-1 text-sm text-ink">
                  {new Date(user.lastSyncedAt).toLocaleString()}
                </p>
              </div>
            </aside>

            <section className="grid content-start gap-4 sm:grid-cols-2">
              <MetricCard
                label="Rank"
                value={formatValue(user.rank)}
                accent="pine"
              />
              <MetricCard
                label="Max rank"
                value={formatValue(user.maxRank)}
                accent="coral"
              />
              <MetricCard label="Rating" value={formatValue(user.rating)} />
              <MetricCard
                label="Max rating"
                value={formatValue(user.maxRating)}
                accent="ink"
              />
            </section>
          </div>
        ) : null}

        <div className="mt-6">
          {activeTab === "contests"
            ? renderContestTable()
            : activeTab === "submissions"
              ? renderSubmissionTable()
              : activeTab === "problems"
                ? renderProblemTable()
                : activeTab === "rating-history"
                  ? renderRatingHistoryTable()
                  : null}
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;
