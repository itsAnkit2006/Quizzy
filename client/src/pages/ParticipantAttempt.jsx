import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function ParticipantAttempt() {
  const { quizId, attemptId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttempt = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/quizzes/admin/${quizId}/attempt/${attemptId}`,
      );

      setData(response.data);
    } catch (error) {
      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to load participant result.",
      );
    } finally {
      setLoading(false);
    }
  }, [quizId, attemptId]);

  useEffect(() => {
    fetchAttempt();
  }, [fetchAttempt]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading result...</p>
      </div>
    );
  }

  if (error || !data) {
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
            {error || "We couldn't load this participant's result."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={fetchAttempt}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>

            <Link
              to={`/admin/quiz/${quizId}/analytics`}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { participant, result, answers } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link
            to="/admin"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Quizzy
          </Link>

          <Link
            to={`/admin/quiz/${quizId}/analytics`}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Analytics
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-5 py-8">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-slate-500">
            Participant Result
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {participant.username}
          </h1>
        </div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Score</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.score}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Correct</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.correctAnswers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Wrong</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.wrongAnswers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">Time</p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatTime(result.timeTaken)}
            </p>
          </div>
        </div>

        {/* Questions */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">Answer Review</h2>

          <div className="mt-5 space-y-4">
            {answers.map((answer) => (
              <div
                key={answer.number}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
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
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      answer.result === "correct"
                        ? "bg-green-100 text-green-700"
                        : answer.result === "wrong"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {answer.result}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  {answer.options.map((option, index) => {
                    const isSelected = answer.selectedAnswer === index;

                    const isCorrect = answer.correctAnswer === index;

                    let style = "border-slate-200 bg-white text-slate-700";

                    if (isCorrect) {
                      style = "border-green-300 bg-green-50 text-green-800";
                    } else if (isSelected) {
                      style = "border-red-300 bg-red-50 text-red-800";
                    }

                    return (
                      <div
                        key={index}
                        className={`rounded-xl border p-3 text-sm ${style}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold">
                            {String.fromCharCode(65 + index)}
                          </span>

                          <span className="flex-1">{option}</span>

                          {isCorrect && (
                            <span className="text-xs font-semibold">
                              Correct
                            </span>
                          )}

                          {isSelected && !isCorrect && (
                            <span className="text-xs font-semibold">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ParticipantAttempt;
