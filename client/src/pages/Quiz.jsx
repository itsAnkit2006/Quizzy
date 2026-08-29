import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function Quiz() {
    const { shareCode } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);

    const fetchQuiz = useCallback(async () => {
        setLoading(true);
        setError("");
        setNotFound(false);

        try {
            const response = await api.get(
                `/quizzes/${shareCode}`
            );

            setQuiz(response.data.quiz);
        } catch (error) {
            if (error.response?.status === 404) {
                setNotFound(true);
                setError(
                    error.response?.data?.message ||
                        "This quiz may have been deleted or the link is incorrect."
                );
            } else {
                setError(
                    error.userMessage ||
                        error.response?.data?.message ||
                        "Unable to load quiz."
                );
            }
        } finally {
            setLoading(false);
        }
    }, [shareCode]);

    useEffect(() => {
        fetchQuiz();
    }, [fetchQuiz]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
                <div className="text-center">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading quiz...
                    </p>
                </div>
            </div>
        );
    }

    if (notFound || error || !quiz) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
                <div className="w-full max-w-md text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
                        ?
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-slate-900">
                        {notFound
                            ? "Quiz not found"
                            : "Unable to load quiz"}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error ||
                            "We couldn't load this quiz. Please try again."}
                    </p>

                    {!notFound && (
                        <button
                            type="button"
                            onClick={fetchQuiz}
                            disabled={loading}
                            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Retrying..."
                                : "Try Again"}
                        </button>
                    )}

                    <Link
                        to="/"
                        className={`${
                            notFound
                                ? "mt-6"
                                : "mt-3"
                        } inline-block rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50`}
                    >
                        Go Home
                    </Link>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-4xl px-5 py-4">
                    <Link
                        to="/"
                        className="text-2xl font-bold tracking-tight text-slate-900"
                    >
                        Quizzy
                    </Link>
                </div>
            </nav>

            <main className="mx-auto max-w-2xl px-5 py-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                    <p className="text-sm font-medium text-slate-500">
                        Quiz
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {quiz.title}
                    </h1>

                    {quiz.description && (
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            {quiz.description}
                        </p>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Questions
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-900">
                                {quiz.questionCount}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Duration
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-900">
                                {quiz.duration} min
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Correct
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-900">
                                +{quiz.positiveMarks}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Wrong
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-900">
                                -{quiz.negativeMarks}
                            </p>
                        </div>

                    </div>

                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <h2 className="text-sm font-semibold text-amber-900">
                            Before you start
                        </h2>

                        <ul className="mt-2 space-y-1 text-sm text-amber-800">
                            <li>
                                • The timer starts when you begin.
                            </li>

                            <li>
                                • The quiz will be submitted automatically when time expires.
                            </li>

                            <li>
                                • Make sure you have a stable internet connection.
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                `/quiz/${shareCode}/attempt`
                            )
                        }
                        className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Start Quiz
                    </button>

                </div>
            </main>
        </div>
    );
}

export default Quiz;