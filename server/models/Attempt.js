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

attemptSchema.index(
    { quiz: 1, user: 1 },
    { unique: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);