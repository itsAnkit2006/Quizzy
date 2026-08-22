import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function Quiz() {
    const { shareCode } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await api.get(
                    `/quizzes/${shareCode}`
                );

                setQuiz(response.data.quiz);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to load quiz."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [shareCode]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
                <p className="text-sm text-slate-500">
                    Loading quiz...
                </p>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
                <div className="w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quiz not found
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        {error ||
                            "This quiz may have been deleted or the link is incorrect."}
                    </p>

                    <Link
                        to="/"
                        className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
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