import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage, importCodeforcesUser } from "../api/users";
import { validateCodeforcesHandle } from "../utils/handleValidation";

const STORAGE_KEY = "cp-recommendation:last-imported-user";

const HomePage = () => {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitImport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateCodeforcesHandle(handle);
    if (validationMessage) {
      setError(validationMessage);
      setSuccess(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await importCodeforcesUser(handle.trim());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
      setSuccess(response.message ?? "Import complete.");

      window.setTimeout(() => {
        navigate("/dashboard", {
          state: {
            user: response.data,
            imported: response.meta?.created ?? false
          }
        });
      }, 450);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">
              v0.1.0 Codeforces import
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-ink sm:text-5xl">
              Competitive Programming Analytics & Recommendation Platform
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
              Import a Codeforces profile and open the first coaching dashboard
              view. This release focuses on the foundation: validated import,
              persistent profile storage, and a clean profile summary.
            </p>
          </div>

          <form
            className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft sm:p-6"
            onSubmit={submitImport}
          >
            <label
              className="text-sm font-semibold text-ink"
              htmlFor="codeforces-handle"
            >
              Codeforces handle
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="codeforces-handle"
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                className="min-h-12 flex-1 rounded-lg border border-ink/15 px-4 text-base outline-none transition focus:border-pine focus:ring-4 focus:ring-pine/10"
                placeholder="tourist"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="min-h-12 rounded-lg bg-pine px-5 font-semibold text-white transition hover:bg-pine/90 disabled:cursor-not-allowed disabled:bg-ink/30"
              >
                {isLoading ? "Importing..." : "Import"}
              </button>
            </div>

            <div className="mt-4 min-h-6" aria-live="polite">
              {error ? (
                <p className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-medium text-coral">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="rounded-lg border border-pine/30 bg-pine/10 px-3 py-2 text-sm font-medium text-pine">
                  {success} Opening dashboard...
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
