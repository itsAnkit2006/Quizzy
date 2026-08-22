import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [shareCode, setShareCode] = useState("");
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            to="/"
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
        <div>
          <p className="text-sm font-medium text-slate-500">
            Your Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Welcome, {user?.username || "User"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Join quizzes, view your results and manage your account.
          </p>
        </div>

        {/* Join Quiz */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Have a quiz code?
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Join a Quiz
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the code shared by your quiz creator.
            </p>
          </div>

          <form
            onSubmit={handleJoinQuiz}
            className="mt-5"
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
        </section>

        {/* Dashboard Cards */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Results */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
              ✓
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              My Results
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View your previous quiz attempts, scores and performance.
            </p>

            <button
              onClick={() =>
                navigate("/dashboard/results")
              }
              className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Results
            </button>
          </div>

          {/* Profile */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
              👤
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Account
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Signed in as{" "}
              <span className="font-semibold text-slate-700">
                {user?.username || "User"}
              </span>
              .
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-400">
                Account Type
              </p>

              <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                {user?.role || "User"}
              </p>
            </div>
          </div>

          {/* Admin */}
          {user?.role === "admin" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
                ⚙
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Admin Panel
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create, edit, share and analyze your quizzes.
              </p>

              <button
                onClick={() => navigate("/admin")}
                className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open Admin Panel
              </button>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate("/")}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-bold text-slate-900">
                Browse Quizzy
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Return to the Quizzy home page.
              </p>
            </button>

            {user?.role === "admin" && (
              <button
                onClick={() =>
                  navigate("/admin/create")
                }
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <p className="text-sm font-bold text-slate-900">
                  Create a Quiz
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Start building a new quiz.
                </p>
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;