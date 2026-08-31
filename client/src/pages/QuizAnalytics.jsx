import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function QuizAnalytics() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificateLoading, setCertificateLoading] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/quizzes/admin/${quizId}/analytics`,
      );

      setData(response.data);
    } catch (error) {
      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to load analytics.",
      );
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatTime = (seconds) => {
    const safeSeconds = Number(seconds || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";

    return rank;
  };

  const getDifficulty = (percentage) => {
    if (percentage >= 80) {
      return {
        label: "Easy",
        className: "bg-slate-100 text-slate-600",
      };
    }

    if (percentage >= 50) {
      return {
        label: "Medium",
        className: "bg-slate-100 text-slate-600",
      };
    }

    return {
      label: "Hard",
      className: "bg-slate-900 text-white",
    };
  };

  // =========================================================
  // Download Certificate
  // =========================================================

  const handleDownloadCertificate = async (entry) => {
    if (Number(entry.percentage || 0) < 40) {
      return;
    }

    setCertificateLoading(entry.attemptId);
    setError("");

    try {
      const response = await api.get(
        `/quizzes/admin/${quizId}/attempt/${entry.attemptId}/certificate`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        },
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `Quizzy-Certificate-${entry.username
        .replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Axios returns the backend JSON error as a Blob
      // when responseType is "blob".
      let message =
        error.userMessage ||
        "Unable to download certificate.";

      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);

          message =
            parsed.message || message;
        } catch {
          // Keep the default message.
        }
      }

      setError(message);
    } finally {
      setCertificateLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-3 text-sm text-slate-500">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-lg font-bold text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Analytics unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Unable to load quiz analytics."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={fetchAnalytics}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>

            <Link
              to="/admin"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    quiz,
    statistics,
    leaderboard = [],
    questionAnalytics = [],
  } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            to="/admin"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Quizzy
          </Link>

          <Link
            to="/admin"
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-5 py-8 pb-12 sm:py-10">
        {/* Header */}
        <header>
          <p className="text-sm font-semibold text-slate-500">
            Quiz Analytics
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {quiz.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {quiz.questionCount} questions
            {" · "}
            {quiz.duration} minutes
          </p>
        </header>

        {/* Certificate error */}
        {error && data && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError("")}
              className="mt-2 text-xs font-semibold text-red-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Statistics */}
        <section className="mt-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Participants */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Participants
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {statistics.participantCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Completed
              </p>
            </div>

            {/* Average score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Average Score
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {statistics.averageScore}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Across all participants
              </p>
            </div>

            {/* Highest score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Highest Score
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {statistics.highestScore}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Best performance
              </p>
            </div>

            {/* Average time */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Average Time
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatTime(statistics.averageTime)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Time per attempt
              </p>
            </div>
          </div>
        </section>

        {/* Top Performers */}
        {leaderboard.length > 0 && (
          <section className="mt-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Top Performers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Highest scores ranked by score and completion time.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 items-end gap-2 sm:gap-4">
              {/* Second */}
              {leaderboard[1] ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/quiz/${quiz.id}/attempt/${leaderboard[1].attemptId}`,
                    )
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:bg-slate-50 sm:p-5"
                >
                  <div className="text-2xl sm:text-3xl">
                    🥈
                  </div>

                  <p className="mt-2 truncate text-sm font-bold text-slate-900">
                    {leaderboard[1].username}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {leaderboard[1].score}
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                    Score
                  </p>
                </button>
              ) : (
                <div />
              )}

              {/* First */}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/admin/quiz/${quiz.id}/attempt/${leaderboard[0].attemptId}`,
                  )
                }
                className="rounded-2xl border-2 border-slate-900 bg-slate-900 p-4 text-center text-white shadow-lg sm:p-6"
              >
                <div className="text-3xl sm:text-4xl">
                  🥇
                </div>

                <p className="mt-2 truncate text-sm font-bold">
                  {leaderboard[0].username}
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {leaderboard[0].score}
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                  Score
                </p>
              </button>

              {/* Third */}
              {leaderboard[2] ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/quiz/${quiz.id}/attempt/${leaderboard[2].attemptId}`,
                    )
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:bg-slate-50 sm:p-5"
                >
                  <div className="text-2xl sm:text-3xl">
                    🥉
                  </div>

                  <p className="mt-2 truncate text-sm font-bold text-slate-900">
                    {leaderboard[2].username}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {leaderboard[2].score}
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                    Score
                  </p>
                </button>
              ) : (
                <div />
              )}
            </div>
          </section>
        )}

        {/* Participants */}
        <section className="mt-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Participants
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Click a participant to view their complete attempt.
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {leaderboard.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  👥
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  No completed attempts
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Participants will appear here after completing the quiz.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.attemptId}`}
                    className="flex w-full items-center gap-3 p-4 transition hover:bg-slate-50"
                  >
                    {/* Rank */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/quiz/${quiz.id}/attempt/${entry.attemptId}`,
                        )
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700"
                    >
                      {getRankDisplay(entry.rank)}
                    </button>

                    {/* User */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/quiz/${quiz.id}/attempt/${entry.attemptId}`,
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-bold text-slate-900">
                        {entry.username}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          {entry.correctAnswers} correct
                        </span>

                        <span>
                          {entry.wrongAnswers} wrong
                        </span>

                        <span>
                          {entry.unanswered} skipped
                        </span>
                      </div>
                    </button>

                    {/* Score */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/quiz/${quiz.id}/attempt/${entry.attemptId}`,
                        )
                      }
                      className="shrink-0 text-right"
                    >
                      <p className="text-lg font-bold text-slate-900">
                        {entry.score}
                      </p>

                      <p className="text-xs font-semibold text-slate-500">
                        {entry.percentage ?? 0}%
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatTime(entry.timeTaken)}
                      </p>
                    </button>

                    {/* Certificate */}
                    {Number(entry.percentage || 0) >= 40 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadCertificate(entry)
                        }
                        disabled={
                          certificateLoading ===
                          entry.attemptId
                        }
                        className="shrink-0 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                      >
                        {certificateLoading ===
                        entry.attemptId
                          ? "Downloading..."
                          : "Certificate"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Question Analysis */}
        <section className="mt-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Question Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See which questions were easy or difficult for participants.
            </p>
          </div>

          {questionAnalytics.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No question data available yet.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {questionAnalytics.map((question) => {
                const difficulty = getDifficulty(
                  question.correctPercentage,
                );

                return (
                  <div
                    key={question.number}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    {/* Question header */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                        {question.number}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-6 text-slate-900">
                          {question.question}
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${difficulty.className}`}
                        >
                          {difficulty.label}
                        </span>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-slate-900">
                          {question.correctPercentage}%
                        </p>

                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          Correct
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all"
                        style={{
                          width: `${question.correctPercentage}%`,
                        }}
                      />
                    </div>

                    {/* Breakdown */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-sm font-bold text-slate-900">
                          {question.correct}
                        </p>

                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Correct
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-sm font-bold text-slate-900">
                          {question.wrong}
                        </p>

                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Wrong
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-sm font-bold text-slate-900">
                          {question.unanswered}
                        </p>

                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Skipped
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom navigation */}
        <div className="mt-8">
          <Link
            to="/admin"
            className="block w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default QuizAnalytics;