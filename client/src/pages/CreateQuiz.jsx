import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const createEmptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
});

function CreateQuiz() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    positiveMarks: 1,
    negativeMarks: 0,
  });

  const [questions, setQuestions] = useState([createEmptyQuestion()]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuizChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleQuestionChange = (questionIndex, value) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              question: value,
            }
          : question,
      ),
    );

    setError("");
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const updatedOptions = [...question.options];

        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
        };
      }),
    );

    setError("");
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              correctAnswer: optionIndex,
            }
          : question,
      ),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const removeQuestion = (indexToRemove) => {
    if (questions.length === 1) {
      setError("A quiz must contain at least one question.");
      return;
    }

    setQuestions((prev) => prev.filter((_, index) => index !== indexToRemove));

    setError("");
  };

  const getCompletedQuestionCount = () => {
    return questions.filter(
      (question) =>
        question.question.trim() &&
        question.options.every((option) => option.trim()),
    ).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    if (Number(formData.duration) < 1) {
      setError("Quiz duration must be at least 1 minute.");
      return;
    }

    if (Number(formData.positiveMarks) < 0) {
      setError("Positive marks cannot be negative.");
      return;
    }

    if (Number(formData.negativeMarks) < 0) {
      setError("Negative marks cannot be negative.");
      return;
    }

    if (questions.length === 0) {
      setError("Please add at least one question.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question.question.trim()) {
        setError(`Please enter Question ${i + 1}.`);
        return;
      }

      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].trim()) {
          setError(`Please fill Option ${j + 1} in Question ${i + 1}.`);
          return;
        }
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        setError(`Please select a correct answer for Question ${i + 1}.`);
        return;
      }
    }

    setLoading(true);

    try {
      const response = await api.post("/quizzes", {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: Number(formData.duration),
        positiveMarks: Number(formData.positiveMarks),
        negativeMarks: Number(formData.negativeMarks),
        questions,
      });

      const shareCode = response.data.quiz.shareCode;

      navigate(`/admin?created=${shareCode}`);
    } catch (error) {
      setError(
        error.userMessage ||
          error.response?.data?.message ||
          "Unable to create quiz.",
      );
    } finally {
      setLoading(false);
    }
  };

  const completedQuestions = getCompletedQuestionCount();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link
            to="/admin"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Quizzy
          </Link>

          <Link
            to="/admin"
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-5 py-8 pb-32 sm:py-10">
        {/* Header */}
        <header>
          <p className="text-sm font-semibold text-slate-500">Admin Panel</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create Quiz
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Configure your quiz, set the marking scheme, and add your questions.
          </p>
        </header>

        {/* Quiz summary */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold text-slate-900">
                {questions.length}
              </p>

              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Questions
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold text-slate-900">
                {formData.duration}
              </p>

              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Minutes
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xl font-bold text-slate-900">
                +{formData.positiveMarks}
              </p>

              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Per Correct
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-500">Negative marking</span>

            <span className="text-xs font-bold text-slate-900">
              {Number(formData.negativeMarks) === 0
                ? "None"
                : `-${formData.negativeMarks}`}
            </span>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Quiz Details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quiz Details</h2>

              <p className="mt-1 text-sm text-slate-500">
                Set the basic information and marking scheme.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {/* Title */}
              <div>
                <label
                  htmlFor="quiz-title"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Quiz Title
                </label>

                <input
                  id="quiz-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleQuizChange}
                  placeholder="e.g. Computer Networks"
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

                <p className="mt-1.5 text-right text-[11px] text-slate-400">
                  {formData.title.length}/100
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="quiz-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="quiz-description"
                  name="description"
                  value={formData.description}
                  onChange={handleQuizChange}
                  placeholder="Describe your quiz..."
                  maxLength={500}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

                <p className="mt-1.5 text-right text-[11px] text-slate-400">
                  {formData.description.length}/500
                </p>
              </div>

              {/* Settings */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Duration */}
                <div>
                  <label
                    htmlFor="quiz-duration"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Duration
                  </label>

                  <div className="relative">
                    <input
                      id="quiz-duration"
                      type="number"
                      name="duration"
                      min="1"
                      value={formData.duration}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-16 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      min
                    </span>
                  </div>
                </div>

                {/* Positive marks */}
                <div>
                  <label
                    htmlFor="positive-marks"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Correct Marks
                  </label>

                  <input
                    id="positive-marks"
                    type="number"
                    name="positiveMarks"
                    min="0"
                    step="0.25"
                    value={formData.positiveMarks}
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                {/* Negative marks */}
                <div>
                  <label
                    htmlFor="negative-marks"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Negative Marks
                  </label>

                  <select
                    id="negative-marks"
                    name="negativeMarks"
                    value={formData.negativeMarks}
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="0">No Negative Marking</option>

                    <option value="0.25">1/4 mark</option>

                    <option value="0.33">1/3 mark</option>

                    <option value="0.5">1/2 mark</option>

                    <option value="0.75">3/4 mark</option>

                    <option value="1">1 mark</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Questions */}
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Questions</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {completedQuestions} of {questions.length} completed
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                {questions.length}
              </span>
            </div>

            <div className="mt-5 space-y-5">
              {questions.map((question, questionIndex) => {
                const isComplete =
                  question.question.trim() &&
                  question.options.every((option) => option.trim());

                return (
                  <div
                    key={questionIndex}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    {/* Question header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                            isComplete
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {questionIndex + 1}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Question {questionIndex + 1}
                          </h3>

                          <p className="text-[11px] text-slate-400">
                            {isComplete ? "Ready" : "Incomplete"}
                          </p>
                        </div>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Question */}
                    <div className="mt-5">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Question
                      </label>

                      <textarea
                        value={question.question}
                        onChange={(e) =>
                          handleQuestionChange(questionIndex, e.target.value)
                        }
                        placeholder="Enter your question..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    {/* Options */}
                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Options
                        </label>

                        <span className="text-[11px] text-slate-400">
                          Select the correct answer below
                        </span>
                      </div>

                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => {
                          const isCorrect =
                            question.correctAnswer === optionIndex;

                          return (
                            <div key={optionIndex}>
                              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                                Option {String.fromCharCode(65 + optionIndex)}
                              </label>

                              <div className="flex gap-2">
                                <div
                                  className={`flex w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                    isCorrect
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>

                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      questionIndex,
                                      optionIndex,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Enter option ${String.fromCharCode(
                                    65 + optionIndex,
                                  )}`}
                                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Correct Answer
                      </label>

                      <select
                        value={question.correctAnswer}
                        onChange={(e) =>
                          handleCorrectAnswerChange(
                            questionIndex,
                            Number(e.target.value),
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      >
                        {question.options.map((_, optionIndex) => (
                          <option key={optionIndex} value={optionIndex}>
                            Option {String.fromCharCode(65 + optionIndex)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add question */}
            <button
              type="button"
              onClick={addQuestion}
              className="mt-5 w-full rounded-xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99]"
            >
              + Add Question
            </button>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="sticky bottom-4 z-20">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Quiz..." : "Create Quiz"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateQuiz;
