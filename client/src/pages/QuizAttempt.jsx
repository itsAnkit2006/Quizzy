import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function QuizAttempt() {
  const { shareCode } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);

  const questions = quiz?.questions || [];

  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const progress =
    questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/quizzes/${shareCode}`);

      const quizData = response.data.quiz;

      const startResponse = await api.post(`/quizzes/${shareCode}/start`);

      const attempt = startResponse.data.attempt;

      setQuiz(quizData);

      const restoredAnswers = {};

      for (const answer of attempt.answers || []) {
        if (
          answer.selectedAnswer !== null &&
          answer.selectedAnswer !== undefined
        ) {
          restoredAnswers[String(answer.questionId)] = answer.selectedAnswer;
        }
      }

      setAnswers(restoredAnswers);

      setTimeLeft(
        Math.max(
          0,
          quizData.duration * 60 -
            Math.floor(
              (Date.now() - new Date(attempt.startedAt).getTime()) / 1000,
            ),
        ),
      );
    } catch (error) {
      if (error.response?.status === 409) {
        setError(
          error.response?.data?.message ||
            "This quiz attempt cannot be started.",
        );
        return;
      }

      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to load quiz.",
      );
    } finally {
      setLoading(false);
    }
  }, [shareCode]);

  const handleSubmit = useCallback(async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");
    setShowSubmitModal(false);

    try {
      const submittedAnswers = questions.map((question) => ({
        questionId: question.id,
        selectedAnswer: answers[question.id] ?? null,
      }));

      const response = await api.post(`/quizzes/${shareCode}/submit`, {
        answers: submittedAnswers,
      });

      navigate(`/quiz/${shareCode}/result/${response.data.result.attemptId}`);
    } catch (error) {
      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to submit quiz.",
      );

      setSubmitting(false);
    }
  }, [submitting, questions, answers, shareCode, navigate]);

    useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

    useEffect(() => {
    if (timeLeft === null || submitting || !quiz) {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting, quiz, handleSubmit]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const selectAnswer = (optionIndex) => {
    const questionId = questions[currentQuestion]?.id;

    if (!questionId) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    setShowQuestionList(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-3 text-sm text-slate-500">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load quiz
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <div className="mt-6 flex gap-3 justify-center">
            <button
              type="button"
              onClick={fetchQuiz}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  if (!question) {
    return null;
  }

  const selectedAnswer = answers[question.id];

  const isLastQuestion = currentQuestion === questions.length - 1;

  const isFirstQuestion = currentQuestion === 0;

  const isLowTime = timeLeft !== null && timeLeft <= 60;

  const isVeryLowTime = timeLeft !== null && timeLeft <= 10;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Quiz name */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-400">
                Quizzy
              </p>

              <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                {quiz.title}
              </h1>
            </div>

            {/* Timer */}
            <div
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 ${
                isVeryLowTime
                  ? "animate-pulse bg-red-100 text-red-700"
                  : isLowTime
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-100 text-slate-900"
              }`}
            >
              <span className="text-xs">⏱</span>

              <span className="font-mono text-sm font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-5">
        {/* Question header */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Question {currentQuestion + 1}
                <span className="font-normal text-slate-400">
                  {" "}
                  of {questions.length}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {answeredCount} of {questions.length} answered
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Question card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold leading-8 tracking-tight text-slate-900 sm:text-2xl sm:leading-9">
            {question.question}
          </h2>

          {/* Options */}
          <div className="mt-7 space-y-3">
            {question.options.map((option, index) => {
              const selected = selectedAnswer === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectAnswer(index)}
                  className={`group flex min-h-[60px] w-full items-center gap-3 rounded-xl border p-3.5 text-left transition active:scale-[0.99] ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      selected
                        ? "bg-white text-slate-900"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="flex-1 text-sm font-medium leading-6">
                    {option}
                  </span>

                  {selected && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Clear answer */}
          {selectedAnswer !== undefined && (
            <button
              type="button"
              onClick={() => {
                const questionId = question.id;

                setAnswers((previous) => {
                  const updated = {
                    ...previous,
                  };

                  delete updated[questionId];

                  return updated;
                });
              }}
              className="mt-4 text-xs font-medium text-slate-400 hover:text-slate-700"
            >
              Clear answer
            </button>
          )}
        </section>

        {/* Question overview */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowQuestionList((previous) => !previous)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">
                Question Overview
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {answeredCount} answered · {questions.length - answeredCount}{" "}
                remaining
              </p>
            </div>

            <span className="text-sm font-bold text-slate-400">
              {showQuestionList ? "⌃" : "⌄"}
            </span>
          </button>

          {showQuestionList && (
            <div className="border-t border-slate-100 p-4">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {questions.map((item, index) => {
                  const answered = answers[item.id] !== undefined;

                  const current = index === currentQuestion;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToQuestion(index)}
                      className={`h-10 rounded-xl text-xs font-bold transition ${
                        current
                          ? "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2"
                          : answered
                            ? "bg-slate-200 text-slate-900"
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                  Current
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  Answered
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-50 ring-1 ring-slate-200" />
                  Unanswered
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrevious}
              disabled={isFirstQuestion}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
              ?
            </div>

            <h2 className="mt-4 text-center text-xl font-bold text-slate-900">
              Submit Quiz?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              You have answered{" "}
              <strong className="text-slate-700">{answeredCount}</strong> out of{" "}
              <strong className="text-slate-700">{questions.length}</strong>{" "}
              questions.
            </p>

            {answeredCount < questions.length && (
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                You still have{" "}
                <strong>{questions.length - answeredCount}</strong> unanswered
                question
                {questions.length - answeredCount !== 1 ? "s" : ""}.
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Continue
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && quiz && (
        <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default QuizAttempt;
