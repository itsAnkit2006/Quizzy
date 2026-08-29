import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenu, setOpenMenu] = useState(null);
  const [deleteQuiz, setDeleteQuiz] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/quizzes/my");

      setQuizzes(response.data.quizzes);
    } catch (error) {
      if (error.response?.status === 403) {
        navigate("/dashboard");
        return;
      }

      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to load quizzes.",
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const copyQuizLink = async (shareCode) => {
    const link = `${window.location.origin}/quiz/${shareCode}`;

    try {
      await navigator.clipboard.writeText(link);

      setCopied(true);
      setOpenMenu(null);

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      window.prompt("Copy this quiz link:", link);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuiz) {
      return;
    }

    setDeleting(true);

    try {
      await api.delete(`/quizzes/${deleteQuiz._id}`);

      setQuizzes((prev) => prev.filter((quiz) => quiz._id !== deleteQuiz._id));

      setDeleteQuiz(null);
      setOpenMenu(null);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(error.response?.data?.message || "Unable to delete quiz.");
    } finally {
      setDeleting(false);
    }
  };

  const totalQuestions = quizzes.reduce(
    (total, quiz) => total + (quiz.questionCount || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            to="/dashboard"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Quizzy
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Admin Panel</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back,{" "}
              <span className="font-semibold text-slate-700">
                {user?.username}
              </span>
              .
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/create")}
            className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
          >
            + Create Quiz
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {/* Total Quizzes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Quizzes
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {quizzes.length}
            </p>
          </div>

          {/* Participants */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Participants
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {quizzes.reduce(
                (total, quiz) => total + (quiz.participantCount || 0),
                0,
              )}
            </p>
          </div>

          {/* Attempts */}
          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Attempts
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {quizzes.reduce(
                (total, quiz) => total + (quiz.attemptCount || 0),
                0,
              )}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-700">
              Unable to load quizzes
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchQuizzes}
              disabled={loading}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>
          </div>
        )}

        {/* Quizzes */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Quizzes</h2>

              <p className="mt-1 text-sm text-slate-500">
                Create, manage and share your quizzes.
              </p>
            </div>

            {quizzes.length > 0 && (
              <span className="text-sm font-medium text-slate-400">
                {quizzes.length} total
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

              <p className="mt-3 text-sm text-slate-500">Loading quizzes...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && quizzes.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
                +
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No quizzes yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Create your first quiz and share the generated link with
                participants.
              </p>

              <button
                onClick={() => navigate("/admin/create")}
                className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create Your First Quiz
              </button>
            </div>
          )}

          {/* Quiz cards */}
          {!loading && quizzes.length > 0 && (
            <div className="mt-6 grid gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Quiz info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {quiz.title}
                      </h3>

                      {quiz.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                          {quiz.questionCount} questions
                        </span>

                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                          {quiz.duration} min
                        </span>

                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                          +{quiz.positiveMarks} / -{quiz.negativeMarks}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>
                          {quiz.participantCount || 0}{" "}
                          {quiz.participantCount === 1
                            ? "participant"
                            : "participants"}
                        </span>

                        <span>
                          {quiz.attemptCount || 0} completed{" "}
                          {quiz.attemptCount === 1 ? "attempt" : "attempts"}
                        </span>
                      </div>
                    </div>

                    {/* Desktop menu */}
                    <div className="relative hidden sm:block">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === quiz._id ? null : quiz._id)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Quiz options"
                      >
                        ⋮
                      </button>

                      {openMenu === quiz._id && (
                        <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            onClick={() =>
                              navigate(`/admin/quiz/${quiz._id}/analytics`)
                            }
                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Analytics
                          </button>

                          <button
                            onClick={() => navigate(`/admin/edit/${quiz._id}`)}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit Quiz
                          </button>

                          <button
                            onClick={() => copyQuizLink(quiz.shareCode)}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Copy Quiz Link
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            onClick={() => {
                              setDeleteQuiz(quiz);
                              setOpenMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Share link */}
                  <div className="mt-5 rounded-xl bg-slate-50 p-3">
                    <p className="truncate text-xs text-slate-400">
                      {window.location.origin}/quiz/
                      {quiz.shareCode}
                    </p>
                  </div>

                  {/* Desktop actions */}
                  <div className="mt-4 hidden gap-2 sm:flex">
                    <button
                      onClick={() =>
                        navigate(`/admin/quiz/${quiz._id}/analytics`)
                      }
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Analytics
                    </button>

                    <button
                      onClick={() => navigate(`/admin/edit/${quiz._id}`)}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => copyQuizLink(quiz.shareCode)}
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Copy Link
                    </button>
                  </div>

                  {/* Mobile actions */}
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
                    <button
                      onClick={() =>
                        navigate(`/admin/quiz/${quiz._id}/analytics`)
                      }
                      className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Analytics
                    </button>

                    <button
                      onClick={() => navigate(`/admin/edit/${quiz._id}`)}
                      className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => copyQuizLink(quiz.shareCode)}
                      className="col-span-2 rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Copy Quiz Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Copy notification */}
      {copied && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          Quiz link copied!
        </div>
      )}

      {/* Delete modal */}
      {deleteQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              !
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Delete quiz?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteQuiz.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteQuiz(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteQuiz}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
