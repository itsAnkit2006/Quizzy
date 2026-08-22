const express = require("express");

const {
    createQuiz,
    getMyQuizzes,
    getQuizByShareCode,
    startQuiz,
    submitQuiz,
    getAttemptResult,
    getLeaderboard,
    updateQuiz,
    getAdminQuiz,
    getQuizAnalytics,
    getParticipantAttempt,
    deleteQuiz,
    getMyResults,
} = require("../controllers/quizController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin
router.post("/", protect, admin, createQuiz);
router.get("/my", protect, admin, getMyQuizzes);

router.get(
    "/admin/:quizId",
    protect,
    admin,
    getAdminQuiz
);

router.get(
    "/admin/:quizId/analytics",
    protect,
    admin,
    getQuizAnalytics
);

router.get(
    "/admin/:quizId/attempt/:attemptId",
    protect,
    admin,
    getParticipantAttempt
);

router.put(
    "/:quizId",
    protect,
    admin,
    updateQuiz
);

router.delete(
    "/:quizId",
    protect,
    admin,
    deleteQuiz
);


// Public
router.get("/:shareCode", getQuizByShareCode);

// Participant

router.get(
    "/my/results",
    protect,
    getMyResults
);

router.post(
    "/:shareCode/start",
    protect,
    startQuiz
);

router.post(
    "/:shareCode/submit",
    protect,
    submitQuiz
);

router.get(
    "/:shareCode/result/:attemptId",
    protect,
    getAttemptResult
);

router.get(
    "/:shareCode/leaderboard",
    protect,
    getLeaderboard
);


module.exports = router;