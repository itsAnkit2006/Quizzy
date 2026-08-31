const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    english: {
      type: String,
      required: true,
      trim: true,
    },

    hindi: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    questionHindi: {
      type: String,
      default: "",
      trim: true,
    },

    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (options) =>
          options.length >= 2,
        message:
          "A question must have at least 2 options.",
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
  },
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
        validator: (questions) =>
          questions.length > 0,
        message:
          "Quiz must contain at least one question.",
      },
    },

    // Stores the question count separately so the admin
    // dashboard doesn't need to load the full questions array.
    questionCount: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
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
  },
);

// Optimizes the admin's "my quizzes" query.
quizSchema.index({
  createdBy: 1,
});

module.exports =
  mongoose.model("Quiz", quizSchema);