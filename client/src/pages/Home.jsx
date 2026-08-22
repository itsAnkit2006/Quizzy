import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const [shareCode, setShareCode] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch {
        user = null;
    }

    const handleJoinQuiz = (event) => {
        event.preventDefault();

        const code = shareCode.trim().toUpperCase();

        if (!code) {
            setError("Please enter a quiz code.");
            return;
        }

        setError("");
        navigate(`/quiz/${code}`);
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">

            {/* Navbar */}
            <nav className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

                    <Link
                        to="/"
                        className="text-2xl font-bold tracking-tight text-slate-900"
                    >
                        Quizzy
                    </Link>

                    <div className="flex items-center gap-2">

                        {token ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                                >
                                    Dashboard
                                </Link>

                                {user?.role === "admin" && (
                                    <Link
                                        to="/admin"
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                    </div>
                </div>
            </nav>

            <main>

                {/* Hero */}
                <section className="px-5 pb-20 pt-16 sm:pt-24">
                    <div className="mx-auto max-w-4xl text-center">

                        <div className="mb-5 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                            Simple. Fast. Competitive.
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                            Test your knowledge.
                            <br />

                            <span className="text-slate-500">
                                Compete with others.
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                            Join quizzes using a unique code, challenge
                            yourself against the clock, and see how you
                            rank on the leaderboard.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                            <button
                                type="button"
                                onClick={() => {
                                    document
                                        .getElementById("join-quiz")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                        });
                                }}
                                className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Join a Quiz
                            </button>

                            <Link
                                to={token ? "/dashboard" : "/login"}
                                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                {token ? "Go to Dashboard" : "Login"}
                            </Link>

                        </div>
                    </div>
                </section>

                {/* Join Quiz */}
                <section
                    id="join-quiz"
                    className="border-y border-slate-200 bg-slate-50 px-5 py-16"
                >
                    <div className="mx-auto max-w-xl text-center">

                        <p className="text-sm font-medium text-slate-500">
                            Have a quiz code?
                        </p>

                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Join a Quiz
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Enter the unique code shared by the quiz creator
                            to start your quiz.
                        </p>

                        <form
                            onSubmit={handleJoinQuiz}
                            className="mt-6"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row">

                                <input
                                    type="text"
                                    value={shareCode}
                                    onChange={(event) => {
                                        setShareCode(
                                            event.target.value.toUpperCase()
                                        );
                                        setError("");
                                    }}
                                    placeholder="Enter quiz code"
                                    maxLength={20}
                                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-slate-900 outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                />

                                <button
                                    type="submit"
                                    className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Join Quiz
                                </button>

                            </div>

                            {error && (
                                <p className="mt-3 text-sm text-red-500">
                                    {error}
                                </p>
                            )}
                        </form>

                    </div>
                </section>

                {/* Features */}
                <section className="px-5 py-16">
                    <div className="mx-auto max-w-6xl">

                        <div className="mb-10 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Everything you need
                            </p>

                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Quizzy is built for competition.
                            </h2>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            <Feature
                                number="01"
                                title="Join a Quiz"
                                description="Enter a quiz code shared by a quiz creator and start testing your knowledge."
                            />

                            <Feature
                                number="02"
                                title="Track Your Results"
                                description="Review your score, correct answers, wrong answers, unanswered questions and completion time."
                            />

                            <Feature
                                number="03"
                                title="Compete"
                                description="Compare your performance with other participants on the quiz leaderboard."
                            />

                        </div>
                    </div>
                </section>

                {/* Admin Section */}
                {user?.role === "admin" && (
                    <section className="border-t border-slate-200 bg-slate-50 px-5 py-16">
                        <div className="mx-auto max-w-4xl text-center">

                            <p className="text-sm font-medium text-slate-500">
                                Quiz Creator
                            </p>

                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Manage your quizzes.
                            </h2>

                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                                Create quizzes, manage questions, review
                                participant performance and analyze results
                                from the admin dashboard.
                            </p>

                            <Link
                                to="/admin"
                                className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Open Admin Panel
                            </Link>

                        </div>
                    </section>
                )}

            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white px-5 py-6">
                <p className="text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} Quizzy. All rights reserved.
                </p>
            </footer>

        </div>
    );
}

function Feature({ number, title, description }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                {number}
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
                {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
            </p>

        </div>
    );
}

export default Home;