import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function QuizResult() {
  const { shareCode, attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);

  const fetchResult = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/quizzes/${shareCode}/result/${attemptId}`,
      );

      setResult(response.data.result);
    } catch (error) {
      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to load result.",
      );
    } finally {
      setLoading(false);
    }
  }, [shareCode, attemptId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
  };

  const filteredAnswers = activeFilter
    ? activeFilter === "all"
      ? result?.answers || []
      : result?.answers?.filter((answer) => answer.result === activeFilter) ||
        []
    : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-3 text-sm text-slate-500">Loading your result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-lg font-bold text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Result unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "We couldn't load your quiz result."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={fetchResult}
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

      <main className="mx-auto max-w-2xl px-5 py-8 pb-12 sm:py-10">
        {/* Completion header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white shadow-sm">
            ✓
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-500">
            Quiz Completed
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {result.quizTitle}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your answers have been submitted successfully.
          </p>
        </div>

        {/* Score */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-7 text-center sm:p-9">
            <p className="text-sm font-medium text-slate-500">Your Score</p>

            <p className="mt-2 text-6xl font-bold tracking-tight text-slate-900 sm:text-7xl">
              {result.score}
            </p>

            <p className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-400">
              Final Score
            </p>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Time Taken</span>

              <span className="font-mono text-sm font-bold text-slate-900">
                {formatTime(result.timeTaken)}
              </span>
            </div>
          </div>
        </section>

        {/* Result stats */}
        <section className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() =>
              setActiveFilter(activeFilter === "correct" ? null : "correct")
            }
            className={`rounded-2xl border p-4 text-center shadow-sm transition ${
              activeFilter === "correct"
                ? "border-green-300 bg-green-50 ring-2 ring-green-100"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-600">
              ✓
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.correctAnswers}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">Correct</p>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveFilter(activeFilter === "wrong" ? null : "wrong")
            }
            className={`rounded-2xl border p-4 text-center shadow-sm transition ${
              activeFilter === "wrong"
                ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
              ×
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.wrongAnswers}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">Wrong</p>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveFilter(
                activeFilter === "unanswered" ? null : "unanswered",
              )
            }
            className={`rounded-2xl border p-4 text-center shadow-sm transition ${
              activeFilter === "unanswered"
                ? "border-slate-400 bg-slate-100 ring-2 ring-slate-200"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
              —
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.unanswered}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">Skipped</p>
          </button>
        </section>

        {/* Question Review */}
        {activeFilter && (
          <section className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Question Review
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {activeFilter === "correct" &&
                    "Showing your correct answers."}

                  {activeFilter === "wrong" &&
                    "Showing your wrong answers and the correct answers."}

                  {activeFilter === "unanswered" &&
                    "Showing questions you skipped."}

                  {activeFilter === "all" && "Review all of your answers."}
                </p>
              </div>

              {activeFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Show All
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {filteredAnswers.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm text-slate-500">
                    No questions in this category.
                  </p>
                </div>
              ) : (
                filteredAnswers.map((answer) => {
                  const isCorrect = answer.result === "correct";

                  const isWrong = answer.result === "wrong";

                  const isUnanswered = answer.result === "unanswered";

                  return (
                    <div
                      key={answer.number}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      {/* Question */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                          {answer.number}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-6 text-slate-900">
                            {answer.question}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isCorrect
                              ? "bg-green-50 text-green-600"
                              : isWrong
                                ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isCorrect
                            ? "Correct"
                            : isWrong
                              ? "Wrong"
                              : "Skipped"}
                        </span>
                      </div>

                      {/* Your Answer */}
                      <div className="mt-5">
                        <p className="text-xs font-medium text-slate-500">
                          Your answer
                        </p>

                        {isUnanswered ? (
                          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-sm font-medium text-slate-400">
                              Not answered
                            </p>
                          </div>
                        ) : (
                          <div
                            className={`mt-2 rounded-xl border px-4 py-3 ${
                              isCorrect
                                ? "border-green-200 bg-green-50"
                                : "border-red-200 bg-red-50"
                            }`}
                          >
                            <p
                              className={`text-sm font-medium ${
                                isCorrect ? "text-green-700" : "text-red-700"
                              }`}
                            >
                              {answer.options[answer.selectedAnswer]}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Correct Answer */}
                      {!isCorrect && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-slate-500">
                            Correct answer
                          </p>

                          <div className="mt-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                            <p className="text-sm font-medium text-green-700">
                              {answer.options[answer.correctAnswer]}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Summary */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Attempt Summary</h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Correct answers</span>

              <span className="text-sm font-semibold text-slate-900">
                {result.correctAnswers}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Wrong answers</span>

              <span className="text-sm font-semibold text-slate-900">
                {result.wrongAnswers}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Unanswered</span>

              <span className="text-sm font-semibold text-slate-900">
                {result.unanswered}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Time Taken
                </span>

                <span className="font-mono text-sm font-bold text-slate-900">
                  {formatTime(result.timeTaken)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate(`/quiz/${shareCode}/leaderboard`)}
            className="w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
          >
            View Leaderboard →
          </button>

          <Link
            to="/dashboard"
            className="block w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default QuizResult;
