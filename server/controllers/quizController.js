const crypto = require("crypto");

const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");

const generateShareCode = async () => {
  let shareCode;
  let exists = true;

  while (exists) {
    shareCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    exists = await Quiz.exists({
      shareCode,
    });
  }

  return shareCode;
};

const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      positiveMarks,
      negativeMarks,
      questions,
    } = req.body;

    if (!title || !duration || !questions) {
      return res.status(400).json({
        message: "Title, duration and questions are required.",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "At least one question is required.",
      });
    }

    const numericDuration = Number(duration);
    const numericPositiveMarks = Number(positiveMarks ?? 1);
    const numericNegativeMarks = Number(negativeMarks ?? 0);

    if (!Number.isFinite(numericDuration) || numericDuration < 1) {
      return res.status(400).json({
        message: "Duration must be at least 1 minute.",
      });
    }

    if (!Number.isFinite(numericPositiveMarks) || numericPositiveMarks < 0) {
      return res.status(400).json({
        message: "Positive marks cannot be negative.",
      });
    }

    if (!Number.isFinite(numericNegativeMarks) || numericNegativeMarks < 0) {
      return res.status(400).json({
        message: "Negative marks cannot be negative.",
      });
    }

    for (const question of questions) {
      if (
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        typeof question.correctAnswer !== "number"
      ) {
        return res.status(400).json({
          message: "Invalid question format.",
        });
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        return res.status(400).json({
          message: "Invalid correct answer.",
        });
      }
    }

    const shareCode = await generateShareCode();

    const quiz = await Quiz.create({
      title: title.trim(),
      description: description?.trim() || "",
      duration: numericDuration,
      positiveMarks: numericPositiveMarks,
      negativeMarks: numericNegativeMarks,
      questions,
      questionCount: questions.length,
      shareCode,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Quiz created successfully.",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        positiveMarks: quiz.positiveMarks,
        negativeMarks: quiz.negativeMarks,
        questionCount: quiz.questionCount,
        shareCode: quiz.shareCode,
      },
    });
  } catch (error) {
    console.error("Create quiz error:", error);

    res.status(500).json({
      message: "Something went wrong while creating the quiz.",
    });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const quizzesPromise = Quiz.find({
      createdBy: req.user._id,
    })
      .select(
        "title description duration positiveMarks negativeMarks shareCode createdAt questionCount",
      )
      .sort({ createdAt: -1 })
      .lean();

    const quizzes = await quizzesPromise;

    if (quizzes.length === 0) {
      return res.json({
        quizzes: [],
      });
    }

    const quizIds = quizzes.map((quiz) => quiz._id);

    const attemptStats = await Attempt.aggregate([
      {
        $match: {
          quiz: { $in: quizIds },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$quiz",

          attemptCount: {
            $sum: 1,
          },

          participants: {
            $addToSet: "$user",
          },
        },
      },
    ]);

    const statsMap = new Map(
      attemptStats.map((stat) => [
        String(stat._id),
        {
          attemptCount: stat.attemptCount,
          participantCount: stat.participants.length,
        },
      ]),
    );

    const formattedQuizzes = quizzes.map((quiz) => {
      const stats = statsMap.get(String(quiz._id));

      return {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        positiveMarks: quiz.positiveMarks,
        negativeMarks: quiz.negativeMarks,
        shareCode: quiz.shareCode,
        createdAt: quiz.createdAt,
        questionCount: quiz.questionCount,
        attemptCount: stats?.attemptCount || 0,
        participantCount: stats?.participantCount || 0,
      };
    });

    res.json({
      quizzes: formattedQuizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);

    res.status(500).json({
      message: "Unable to fetch quizzes.",
    });
  }
};

const getQuizByShareCode = async (req, res) => {
  try {
    const { shareCode } = req.params;

    const quiz = await Quiz.findOne({
      shareCode: shareCode.toUpperCase(),
    }).lean();

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    const publicQuestions = quiz.questions.map((question, index) => ({
      id: question._id,
      number: index + 1,
      question: question.question,
      options: question.options,
    }));

    res.json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        positiveMarks: quiz.positiveMarks,
        negativeMarks: quiz.negativeMarks,
        questionCount: quiz.questions.length,
        questions: publicQuestions,
      },
    });
  } catch (error) {
    console.error("Get quiz error:", error);

    res.status(500).json({
      message: "Unable to load quiz.",
    });
  }
};

const startQuiz = async (req, res) => {
  try {
    const { shareCode } = req.params;

    const quiz = await Quiz.findOne({
      shareCode: shareCode.toUpperCase(),
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    const existingAttempt = await Attempt.findOne({
      quiz: quiz._id,
      user: req.user._id,
    });

    if (existingAttempt) {
      if (existingAttempt.status === "completed") {
        return res.status(409).json({
          message: "You have already completed this quiz.",
        });
      }

      return res.json({
        message: "Existing attempt found.",
        attempt: {
          id: existingAttempt._id,
          startedAt: existingAttempt.startedAt,
          status: existingAttempt.status,
          answers: existingAttempt.answers,
        },
      });
    }

    const attempt = await Attempt.create({
      quiz: quiz._id,
      user: req.user._id,
      startedAt: new Date(),
      status: "in-progress",
    });

    res.status(201).json({
      message: "Quiz started.",
      attempt: {
        id: attempt._id,
        startedAt: attempt.startedAt,
        status: attempt.status,
        answers: attempt.answers,
      },
    });
  } catch (error) {
    console.error("Start quiz error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have an attempt for this quiz.",
      });
    }

    res.status(500).json({
      message: "Unable to start quiz.",
    });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { shareCode } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "Invalid answers.",
      });
    }

    const quiz = await Quiz.findOne({
      shareCode: shareCode.toUpperCase(),
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    const attempt = await Attempt.findOne({
      quiz: quiz._id,
      user: req.user._id,
      status: "in-progress",
    });

    if (!attempt) {
      return res.status(400).json({
        message: "You have not started this quiz.",
      });
    }

    if (attempt.status === "completed") {
      return res.status(409).json({
        message: "You have already submitted this quiz.",
      });
    }

    const now = new Date();

    const elapsedSeconds = Math.floor(
      (now.getTime() - attempt.startedAt.getTime()) / 1000,
    );

    const allowedSeconds = quiz.duration * 60;

    /*
     * Give a small 5-second server tolerance for
     * network latency, but never trust the client's
     * submitted time.
     */
    if (elapsedSeconds > allowedSeconds + 5) {
      return res.status(400).json({
        message: "The quiz time has expired.",
      });
    }

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;

    const processedAnswers = [];

    for (const question of quiz.questions) {
      const submittedAnswer = answers.find(
        (answer) => String(answer.questionId) === String(question._id),
      );

      const selectedAnswer = submittedAnswer?.selectedAnswer;

      if (selectedAnswer === null || selectedAnswer === undefined) {
        unanswered++;

        processedAnswers.push({
          questionId: question._id,
          selectedAnswer: null,
        });

        continue;
      }

      const selected = Number(selectedAnswer);

      if (
        !Number.isInteger(selected) ||
        selected < 0 ||
        selected >= question.options.length
      ) {
        unanswered++;

        processedAnswers.push({
          questionId: question._id,
          selectedAnswer: null,
        });

        continue;
      }

      processedAnswers.push({
        questionId: question._id,
        selectedAnswer: selected,
      });

      if (selected === question.correctAnswer) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    }

    const score =
      correctAnswers * quiz.positiveMarks - wrongAnswers * quiz.negativeMarks;

    const finalScore = Number(Math.max(0, score).toFixed(2));

    attempt.answers = processedAnswers;
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.unanswered = unanswered;
    attempt.score = finalScore;
    attempt.timeTaken = Math.min(elapsedSeconds, allowedSeconds);
    attempt.submittedAt = now;
    attempt.status = "completed";

    await attempt.save();

    res.status(200).json({
      message: "Quiz submitted successfully.",
      result: {
        attemptId: attempt._id,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score: finalScore,
        timeTaken: attempt.timeTaken,
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);

    res.status(500).json({
      message: "Unable to submit quiz.",
    });
  }
};

const getAttemptResult = async (req, res) => {
  try {
    const { shareCode, attemptId } = req.params;

    const quiz = await Quiz.findOne({
      shareCode: shareCode.toUpperCase(),
    }).lean();

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      quiz: quiz._id,
      user: req.user._id,
      status: "completed",
    }).lean();

    if (!attempt) {
      return res.status(404).json({
        message: "Result not found.",
      });
    }

    const answers = quiz.questions.map((question, index) => {
      const submitted = attempt.answers.find(
        (answer) => String(answer.questionId) === String(question._id),
      );

      const selectedAnswer = submitted?.selectedAnswer ?? null;

      let result = "unanswered";

      if (selectedAnswer !== null) {
        result =
          selectedAnswer === question.correctAnswer ? "correct" : "wrong";
      }

      return {
        number: index + 1,

        question: question.question,

        options: question.options,

        selectedAnswer,

        correctAnswer: question.correctAnswer,

        result,
      };
    });

    res.json({
      result: {
        attemptId: attempt._id,
        quizTitle: quiz.title,

        correctAnswers: attempt.correctAnswers,

        wrongAnswers: attempt.wrongAnswers,

        unanswered: attempt.unanswered,

        score: attempt.score,

        timeTaken: attempt.timeTaken,

        submittedAt: attempt.submittedAt,

        answers,
      },
    });
  } catch (error) {
    console.error("Get result error:", error);

    res.status(500).json({
      message: "Unable to load result.",
    });
  }
};

const getMyResults = async (req, res) => {
  try {
    const attempts = await Attempt.find({
      user: req.user._id,
      status: "completed",
    })
      .populate("quiz", "title shareCode duration positiveMarks negativeMarks")
      .sort({ submittedAt: -1 })
      .lean();

    const results = attempts
      .filter((attempt) => attempt.quiz)
      .map((attempt) => ({
        attemptId: attempt._id,

        quizId: attempt.quiz._id,
        quizTitle: attempt.quiz.title,
        shareCode: attempt.quiz.shareCode,

        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        unanswered: attempt.unanswered,

        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
      }));

    res.json({
      results,
    });
  } catch (error) {
    console.error("Get my results error:", error);

    res.status(500).json({
      message: "Unable to load your results.",
    });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { shareCode } = req.params;

    const quiz = await Quiz.findOne({
      shareCode: shareCode.toUpperCase(),
    }).select("_id title shareCode");

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    const attempts = await Attempt.find({
      quiz: quiz._id,
      status: "completed",
    })
      .populate("user", "username")
      .sort({
        score: -1,
        timeTaken: 1,
        submittedAt: 1,
      })
      .lean();

    const leaderboard = attempts.map((attempt, index) => ({
      rank: index + 1,
      username: attempt.user?.username || "Unknown User",
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      unanswered: attempt.unanswered,
      timeTaken: attempt.timeTaken,
    }));

    res.json({
      quiz: {
        title: quiz.title,
        shareCode: quiz.shareCode,
      },
      leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);

    res.status(500).json({
      message: "Unable to load leaderboard.",
    });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const {
      title,
      description,
      duration,
      positiveMarks,
      negativeMarks,
      questions,
    } = req.body;

    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    if (
      !title ||
      !duration ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message:
          "Title, duration and questions are required.",
      });
    }

    const numericDuration = Number(duration);
    const numericPositiveMarks = Number(
      positiveMarks ?? 1,
    );
    const numericNegativeMarks = Number(
      negativeMarks ?? 0,
    );

    if (
      !Number.isFinite(numericDuration) ||
      numericDuration < 1
    ) {
      return res.status(400).json({
        message: "Duration must be at least 1 minute.",
      });
    }

    if (
      !Number.isFinite(numericPositiveMarks) ||
      numericPositiveMarks < 0
    ) {
      return res.status(400).json({
        message: "Positive marks cannot be negative.",
      });
    }

    if (
      !Number.isFinite(numericNegativeMarks) ||
      numericNegativeMarks < 0
    ) {
      return res.status(400).json({
        message: "Negative marks cannot be negative.",
      });
    }

    for (const question of questions) {
      if (
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        typeof question.correctAnswer !== "number" ||
        question.correctAnswer < 0 ||
        question.correctAnswer >= 4
      ) {
        return res.status(400).json({
          message: "Invalid question format.",
        });
      }

      if (
        question.options.some(
          (option) =>
            typeof option !== "string" ||
            !option.trim(),
        )
      ) {
        return res.status(400).json({
          message: "All options must be filled.",
        });
      }
    }

    quiz.title = title.trim();
    quiz.description = description?.trim() || "";
    quiz.duration = numericDuration;
    quiz.positiveMarks = numericPositiveMarks;
    quiz.negativeMarks = numericNegativeMarks;
    quiz.questions = questions;
    quiz.questionCount = questions.length;

    await quiz.save();

    res.json({
      message: "Quiz updated successfully.",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        shareCode: quiz.shareCode,
        questionCount: quiz.questionCount,
      },
    });
  } catch (error) {
    console.error("Update quiz error:", error);

    res.status(500).json({
      message: "Unable to update quiz.",
    });
  }
};

const getAdminQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: req.user._id,
    }).lean();

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    res.json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        positiveMarks: quiz.positiveMarks,
        negativeMarks: quiz.negativeMarks,
        shareCode: quiz.shareCode,
        questions: quiz.questions.map((question) => ({
          id: question._id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
        })),
      },
    });
  } catch (error) {
    console.error("Get admin quiz error:", error);

    res.status(500).json({
      message: "Unable to load quiz.",
    });
  }
};

const getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Make sure this quiz belongs to the logged-in admin
    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: req.user._id,
    }).lean();

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    const attempts = await Attempt.find({
      quiz: quiz._id,
      status: "completed",
    })
      .select(
        "user answers score correctAnswers wrongAnswers unanswered timeTaken submittedAt",
      )
      .populate("user", "username")
      .lean();

    // Count unique participants, not total attempts.
    const participantIds = new Set(
      attempts.map((attempt) => String(attempt.user?._id || attempt.user)),
    );

    const participantCount = participantIds.size;

    let averageScore = 0;
    let highestScore = 0;
    let averageTime = 0;

    if (attempts.length > 0) {
      let totalScore = 0;
      let totalTime = 0;

      for (const attempt of attempts) {
        totalScore += Number(attempt.score || 0);
        totalTime += Number(attempt.timeTaken || 0);

        const score = Number(attempt.score || 0);

        if (score > highestScore) {
          highestScore = score;
        }
      }

      averageScore = Number((totalScore / attempts.length).toFixed(2));

      averageTime = Math.round(totalTime / attempts.length);
    }

    // Sort leaderboard
    const leaderboard = [...attempts]
      .sort((a, b) => {
        const scoreDifference = Number(b.score || 0) - Number(a.score || 0);

        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        const timeDifference =
          Number(a.timeTaken || 0) - Number(b.timeTaken || 0);

        if (timeDifference !== 0) {
          return timeDifference;
        }

        return new Date(a.submittedAt) - new Date(b.submittedAt);
      })
      .map((attempt, index) => ({
        rank: index + 1,
        attemptId: attempt._id,
        username: attempt.user?.username || "Unknown User",
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        unanswered: attempt.unanswered,
        timeTaken: attempt.timeTaken,
      }));

    // Build question analytics using Maps for
    // faster answer lookups.
    const questionAnalytics = quiz.questions.map((question, questionIndex) => {
      let correct = 0;
      let wrong = 0;
      let unanswered = 0;

      for (const attempt of attempts) {
        const answerMap = new Map(
          (attempt.answers || []).map((answer) => [
            String(answer.questionId),
            answer.selectedAnswer,
          ]),
        );

        const selectedAnswer = answerMap.get(String(question._id));

        if (selectedAnswer === undefined || selectedAnswer === null) {
          unanswered++;
        } else if (selectedAnswer === question.correctAnswer) {
          correct++;
        } else {
          wrong++;
        }
      }

      const total = correct + wrong + unanswered;

      const correctPercentage =
        total > 0 ? Number(((correct / total) * 100).toFixed(1)) : 0;

      return {
        number: questionIndex + 1,
        question: question.question,
        correct,
        wrong,
        unanswered,
        correctPercentage,
      };
    });

    res.json({
      quiz: {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        questionCount: quiz.questions.length,
        shareCode: quiz.shareCode,
      },

      statistics: {
        participantCount,
        averageScore,
        highestScore,
        averageTime,
      },

      leaderboard,

      questionAnalytics,
    });
  } catch (error) {
    console.error("Quiz analytics error:", error);

    res.status(500).json({
      message: "Unable to load quiz analytics.",
    });
  }
};

const getParticipantAttempt = async (req, res) => {
  try {
    const { quizId, attemptId } = req.params;

    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: req.user._id,
    }).lean();

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      quiz: quiz._id,
      status: "completed",
    })
      .populate("user", "username")
      .lean();

    if (!attempt) {
      return res.status(404).json({
        message: "Participant attempt not found.",
      });
    }

    const answers = quiz.questions.map((question, index) => {
      const submitted = attempt.answers.find(
        (answer) => String(answer.questionId) === String(question._id),
      );

      const selectedAnswer = submitted?.selectedAnswer ?? null;

      let result = "unanswered";

      if (selectedAnswer !== null) {
        result =
          selectedAnswer === question.correctAnswer ? "correct" : "wrong";
      }

      return {
        number: index + 1,
        question: question.question,
        options: question.options,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        result,
      };
    });

    res.json({
      participant: {
        username: attempt.user?.username || "Unknown User",
      },

      result: {
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        unanswered: attempt.unanswered,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
      },

      answers,
    });
  } catch (error) {
    console.error("Participant attempt error:", error);

    res.status(500).json({
      message: "Unable to load participant result.",
    });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    // Make sure the quiz belongs to the logged-in admin
    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found.",
      });
    }

    // Delete all attempts associated with this quiz
    await Attempt.deleteMany({
      quiz: quiz._id,
    });

    // Delete the quiz itself
    await Quiz.deleteOne({
      _id: quiz._id,
    });

    res.json({
      message: "Quiz deleted successfully.",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);

    res.status(500).json({
      message: "Unable to delete quiz.",
    });
  }
};

module.exports = {
  createQuiz,
  getMyQuizzes,
  getQuizByShareCode,
  startQuiz,
  submitQuiz,
  getAttemptResult,
  getMyResults,
  getLeaderboard,
  updateQuiz,
  getAdminQuiz,
  getQuizAnalytics,
  getParticipantAttempt,
  deleteQuiz,
};
