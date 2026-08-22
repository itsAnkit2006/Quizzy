import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [shareCode, setShareCode] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleJoinQuiz = (e) => {
    e.preventDefault();

    const code = shareCode.trim().toUpperCase();

    if (!code) {
      setError("Please enter a quiz code.");
      return;
    }

    setError("");

    navigate(`/quiz/${code}`);
  };

  const handleCreateQuiz = () => {
    if (user) {
      navigate("/admin/create");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
        <section className="px-5 pb-20 pt-16 sm:pb-24 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Simple. Fast. Competitive.
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Create.
              <br />
              <span className="text-slate-500">
                Share. Compete.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Quizzy makes it easy to create quizzes, share them
              with others, and compete on the leaderboard.
            </p>

            {/* Main actions */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCreateQuiz}
                className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create a Quiz
              </button>

              <a
                href="#join"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Join a Quiz
              </a>
            </div>
          </div>
        </section>

        {/* Join Quiz */}
        <section
          id="join"
          className="border-y border-slate-200 bg-slate-50 px-5 py-16"
        >
          <div className="mx-auto max-w-xl">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">
                Have a quiz code?
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Join a Quiz
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter the code shared by your quiz creator.
              </p>
            </div>

            <form
              onSubmit={handleJoinQuiz}
              className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={shareCode}
                  onChange={(e) => {
                    setShareCode(
                      e.target.value.toUpperCase(),
                    );
                    setError("");
                  }}
                  placeholder="Enter quiz code"
                  maxLength={20}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3.5 text-sm font-semibold uppercase tracking-wider outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Join Quiz
                </button>
              </div>

              {error && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}
            </form>
          </div>
        </section>

        {/* Features */}
        <section className="px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-slate-500">
                Everything you need
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Built for simple quizzes
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Create, share and analyze quizzes without unnecessary
                complexity.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Feature
                number="01"
                title="Create Quizzes"
                description="Build custom quizzes with questions, multiple-choice options, duration and negative marking."
              />

              <Feature
                number="02"
                title="Share Instantly"
                description="Every quiz gets a unique share code that you can send directly to your participants."
              />

              <Feature
                number="03"
                title="Track Results"
                description="View scores, completion times, leaderboards and question-by-question performance."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-200 bg-slate-50 px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">
                How it works
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Four simple steps
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Step
                number="1"
                title="Create"
                description="Build your quiz with your own questions."
              />

              <Step
                number="2"
                title="Share"
                description="Send the generated quiz code to participants."
              />

              <Step
                number="3"
                title="Compete"
                description="Participants answer questions against the clock."
              />

              <Step
                number="4"
                title="Analyze"
                description="Check scores and detailed quiz performance."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to create your first quiz?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Create a quiz, share it with your friends or classmates,
              and see who comes out on top.
            </p>

            <button
              type="button"
              onClick={handleCreateQuiz}
              className="mt-6 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Get Started
            </button>
          </div>
        </section>
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

function Feature({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="text-xs font-bold tracking-widest text-slate-400">
        {number}
      </span>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default Home;