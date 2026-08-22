import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function QuizResult() {
  const { shareCode, attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await api.get(
          `/quizzes/${shareCode}/result/${attemptId}`,
        );

        setResult(response.data.result);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setError(error.response?.data?.message || "Unable to load result.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [shareCode, attemptId, navigate]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
  };

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

          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Go to Dashboard
          </Link>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-600">
              ✓
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.correctAnswers}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">Correct</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
              ×
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.wrongAnswers}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">Wrong</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
              —
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {result.unanswered}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">Skipped</p>
          </div>
        </section>

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

        {/* Question Review */}
        <section className="mt-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Question Review
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review your answers and see the correct answers.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {result.answers.map((answer) => {
              const isCorrect = answer.result === "correct";

              const isWrong = answer.result === "wrong";

              const isUnanswered = answer.result === "unanswered";

              return (
                <div
                  key={answer.number}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                      {answer.number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-6 text-slate-900">
                        {answer.question}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isCorrect && (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                          Correct
                        </span>
                      )}

                      {isWrong && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                          Wrong
                        </span>
                      )}

                      {isUnanswered && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          Skipped
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Your answer */}
                  <div className="mt-5">
                    <p className="text-xs font-medium text-slate-500">
                      Your answer
                    </p>

                    {answer.selectedAnswer === null ? (
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

                  {/* Correct answer */}
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
            })}
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
