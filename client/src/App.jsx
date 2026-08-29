import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Load pages only when they are needed
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardResults = lazy(() =>
  import("./pages/DashboardResults")
);

const AdminDashboard = lazy(() =>
  import("./pages/AdminDashboard")
);

const CreateQuiz = lazy(() =>
  import("./pages/CreateQuiz")
);

const EditQuiz = lazy(() =>
  import("./pages/EditQuiz")
);

const QuizAnalytics = lazy(() =>
  import("./pages/QuizAnalytics")
);

const ParticipantAttempt = lazy(() =>
  import("./pages/ParticipantAttempt")
);

const Quiz = lazy(() => import("./pages/Quiz"));
const QuizAttempt = lazy(() =>
  import("./pages/QuizAttempt")
);

const QuizResult = lazy(() =>
  import("./pages/QuizResult")
);

const Leaderboard = lazy(() =>
  import("./pages/Leaderboard")
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading Quizzy...
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* Public */}
            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* Logged-in users */}
            <Route element={<ProtectedRoute />}>

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/dashboard/results"
                element={<DashboardResults />}
              />

              {/* Admin only */}
              <Route element={<AdminRoute />}>

                <Route
                  path="/admin"
                  element={<AdminDashboard />}
                />

                <Route
                  path="/admin/create"
                  element={<CreateQuiz />}
                />

                <Route
                  path="/admin/edit/:quizId"
                  element={<EditQuiz />}
                />

                <Route
                  path="/admin/quiz/:quizId/analytics"
                  element={<QuizAnalytics />}
                />

                <Route
                  path="/admin/quiz/:quizId/attempt/:attemptId"
                  element={<ParticipantAttempt />}
                />

              </Route>

            </Route>

            {/* Quiz */}
            <Route
              path="/quiz/:shareCode"
              element={<Quiz />}
            />

            <Route
              path="/quiz/:shareCode/attempt"
              element={<QuizAttempt />}
            />

            <Route
              path="/quiz/:shareCode/result/:attemptId"
              element={<QuizResult />}
            />

            <Route
              path="/quiz/:shareCode/leaderboard"
              element={<Leaderboard />}
            />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;