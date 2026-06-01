import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import type { UserProfile } from "../types/user";

const STORAGE_KEY = "cp-recommendation:last-imported-user";

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

const DashboardPage = () => {
  const location = useLocation();
  const routeState = location.state as DashboardLocationState | null;
  const [user] = useState<UserProfile | null>(
    () => routeState?.user ?? readStoredUser()
  );

  const fullName = useMemo(() => {
    if (!user) {
      return "";
    }

    return [user.firstName, user.lastName].filter(Boolean).join(" ");
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
      </section>
    </main>
  );
};

export default DashboardPage;
