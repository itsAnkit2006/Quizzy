const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        selectedAnswer: {
            type: Number,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const attemptSchema = new mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        startedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },

        answers: {
            type: [answerSchema],
            default: [],
        },

        correctAnswers: {
            type: Number,
            default: 0,
        },

        wrongAnswers: {
            type: Number,
            default: 0,
        },

        unanswered: {
            type: Number,
            default: 0,
        },

        score: {
            type: Number,
            default: 0,
        },

        timeTaken: {
            type: Number,
            default: 0,
        },

        submittedAt: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["in-progress", "completed"],
            default: "in-progress",
        },
    },
    {
        timestamps: true,
    }
);

// Prevent multiple attempts by the same user
// for the same quiz.
attemptSchema.index(
    { quiz: 1, user: 1 },
    { unique: true }
);

// Optimizes quiz attempt/leaderboard/analytics queries.
attemptSchema.index({
    quiz: 1,
    status: 1,
});

// Optimizes user's completed-results queries.
attemptSchema.index({
    user: 1,
    status: 1,
});

module.exports = mongoose.model("Attempt", attemptSchema);