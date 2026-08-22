import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function DashboardResults() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get("/quizzes/my/results");

        setResults(response.data.results || []);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to load your results.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${String(
      remainingSeconds,
    ).padStart(2, "0")}s`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading your results...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link
            to="/dashboard"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Quizzy
          </Link>

          <Link
            to="/dashboard"
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Your Activity
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            My Results
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            View your completed quizzes and performance.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error && results.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg">
              ✓
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No results yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Complete a quiz and your result will appear here.
            </p>

            <Link
              to="/"
              className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Join a Quiz
            </Link>
          </div>
        )}

        {/* Results */}
        {!error && results.length > 0 && (
          <div className="mt-8 space-y-4">
            {results.map((result) => (
              <div
                key={result.attemptId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  {/* Quiz information */}
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-slate-900">
                      {result.quizTitle}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Completed{" "}
                      {formatDate(result.submittedAt)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {result.correctAnswers} correct
                      </span>

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {result.wrongAnswers} wrong
                      </span>

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {result.unanswered} unanswered
                      </span>

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {formatTime(result.timeTaken)}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-medium text-slate-400">
                        Score
                      </p>

                      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                        {result.score}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/quiz/${result.shareCode}/result/${result.attemptId}`,
                        )
                      }
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      View Result
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/dashboard"
          className="mt-6 block w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      </main>
    </div>
  );
}

export default DashboardResults;