import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function Leaderboard() {
  const { shareCode } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/quizzes/${shareCode}/leaderboard`);

      setQuiz(response.data.quiz);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to load leaderboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [shareCode]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) {
      return "🥇";
    }

    if (rank === 2) {
      return "🥈";
    }

    if (rank === 3) {
      return "🥉";
    }

    return rank;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-3 text-sm text-slate-500">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-lg font-bold text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Leaderboard unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={fetchLeaderboard}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>

            <Link
              to="/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
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
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-5 py-8 pb-12 sm:py-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl">
            🏆
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Leaderboard
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {quiz?.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            See how everyone performed.
          </p>
        </div>

        {/* Top 3 */}
        {leaderboard.length >= 1 && (
          <section className="mt-8 grid grid-cols-3 items-end gap-2 sm:gap-4">
            {/* Second */}
            {leaderboard[1] ? (
              <div className="order-1">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:p-5">
                  <div className="text-2xl sm:text-3xl">🥈</div>

                  <p className="mt-2 truncate text-sm font-bold text-slate-900">
                    {leaderboard[1].username}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {leaderboard[1].score}
                  </p>

                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Score
                  </p>
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* First */}
            <div className="order-2">
              <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 p-4 text-center text-white shadow-lg sm:p-6">
                <div className="text-3xl sm:text-4xl">🥇</div>

                <p className="mt-2 truncate text-sm font-bold">
                  {leaderboard[0].username}
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {leaderboard[0].score}
                </p>

                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Score
                </p>
              </div>
            </div>

            {/* Third */}
            {leaderboard[2] ? (
              <div className="order-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:p-5">
                  <div className="text-2xl sm:text-3xl">🥉</div>

                  <p className="mt-2 truncate text-sm font-bold text-slate-900">
                    {leaderboard[2].username}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {leaderboard[2].score}
                  </p>

                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Score
                  </p>
                </div>
              </div>
            ) : (
              <div />
            )}
          </section>
        )}

        {/* Full leaderboard */}
        {leaderboard.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              🏆
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No results yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No completed attempts have been submitted yet.
            </p>
          </div>
        ) : (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                All Participants
              </h2>

              <span className="text-xs font-medium text-slate-400">
                {leaderboard.length} participants
              </span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((entry) => {
                const isCurrentUser = entry.username === currentUser?.username;

                const isTopThree = entry.rank <= 3;

                return (
                  <div
                    key={`${entry.rank}-${entry.username}`}
                    className={`rounded-2xl border p-4 transition ${
                      isCurrentUser
                        ? "border-slate-900 bg-slate-900 text-white shadow-md"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          isCurrentUser
                            ? "bg-white text-slate-900"
                            : isTopThree
                              ? "bg-slate-100 text-slate-900"
                              : "bg-slate-50 text-slate-500"
                        }`}
                      >
                        {getRankDisplay(entry.rank)}
                      </div>

                      {/* User */}
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <p
                            className={`truncate text-sm font-bold ${
                              isCurrentUser ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {entry.username}
                          </p>

                          {isCurrentUser && (
                            <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              You
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-1 truncate text-xs ${
                            isCurrentUser ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {entry.correctAnswers} correct
                          {" · "}
                          {entry.wrongAnswers} wrong
                          {" · "}
                          {formatTime(entry.timeTaken)}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-lg font-bold ${
                            isCurrentUser ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {entry.score}
                        </p>

                        <p
                          className={`text-[10px] uppercase tracking-wide ${
                            isCurrentUser ? "text-slate-400" : "text-slate-400"
                          }`}
                        >
                          score
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Back */}
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

export default Leaderboard;
