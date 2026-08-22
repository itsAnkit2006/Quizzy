const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },

        options: {
            type: [String],
            required: true,
            validate: {
                validator: (options) => options.length >= 2,
                message: "A question must have at least 2 options.",
            },
        },

        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: true,
    }
);

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        duration: {
            type: Number,
            required: true,
            min: 1,
        },

        positiveMarks: {
            type: Number,
            required: true,
            min: 0,
            default: 1,
        },

        negativeMarks: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        questions: {
            type: [questionSchema],
            required: true,
            validate: {
                validator: (questions) => questions.length > 0,
                message: "Quiz must contain at least one question.",
            },
        },

        shareCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Quiz", quizSchema);