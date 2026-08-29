import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import QuizBuilder from "../components/QuizBuilder";

function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/quizzes/admin/${quizId}`);

      setQuiz(response.data.quiz);
    } catch (error) {
      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to load quiz.",
      );
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleSubmit = async (data) => {
    setSaving(true);
    setError("");

    try {
      await api.put(`/quizzes/${quizId}`, data);

      navigate("/admin");
    } catch (error) {
      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to update quiz.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-lg font-bold text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load quiz
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "We couldn't load this quiz."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={fetchQuiz}
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
            to="/admin"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">Admin Panel</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Edit Quiz
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Update your quiz details and questions.
          </p>
        </div>

        <QuizBuilder
          initialData={quiz}
          onSubmit={handleSubmit}
          submitText="Save Changes"
          loading={saving}
        />
      </main>
    </div>
  );
}

export default EditQuiz;
