import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardResults from "./pages/DashboardResults";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import AdminDashboard from "./pages/AdminDashboard";
import CreateQuiz from "./pages/CreateQuiz";
import EditQuiz from "./pages/EditQuiz";
import QuizAnalytics from "./pages/QuizAnalytics";
import ParticipantAttempt from "./pages/ParticipantAttempt";

import Quiz from "./pages/Quiz";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
    </BrowserRouter>
  );
}

export default App;