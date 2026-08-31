import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const createEmptyQuestion = () => ({
  question: "",
  questionHindi: "",
  options: [
    {
      english: "",
      hindi: "",
    },
    {
      english: "",
      hindi: "",
    },
    {
      english: "",
      hindi: "",
    },
    {
      english: "",
      hindi: "",
    },
  ],
  correctAnswer: 0,
});

const EXPECTED_HEADERS = [
  "Question English",
  "Question Hindi",
  "A English",
  "A Hindi",
  "B English",
  "B Hindi",
  "C English",
  "C Hindi",
  "D English",
  "D Hindi",
  "Answer",
];

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);

  return values;
}

function normalizeHeader(header) {
  return String(header ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function cleanCSVValue(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim();
}

function getAnswerIndex(answer) {
  const normalized = cleanCSVValue(answer)
    .toUpperCase()
    .replace(/\s+/g, "");

  switch (normalized) {
    case "A":
    case "1":
      return 0;

    case "B":
    case "2":
      return 1;

    case "C":
    case "3":
      return 2;

    case "D":
    case "4":
      return 3;

    default:
      return -1;
  }
}

function CreateQuiz() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    positiveMarks: 1,
    negativeMarks: 0,
  });

  const [questions, setQuestions] = useState([
    createEmptyQuestion(),
  ]);

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const handleQuizChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // QUESTION CHANGE
  // =========================================================

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

  const handleQuestionHindiChange = (
    questionIndex,
    value,
  ) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              questionHindi: value,
            }
          : question,
      ),
    );

    setError("");
  };

  // =========================================================
  // OPTION CHANGE
  // =========================================================

  const handleOptionChange = (
    questionIndex,
    optionIndex,
    language,
    value,
  ) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const updatedOptions = question.options.map(
          (option, currentIndex) =>
            currentIndex === optionIndex
              ? {
                  ...option,
                  [language]: value,
                }
              : option,
        );

        return {
          ...question,
          options: updatedOptions,
        };
      }),
    );

    setError("");
  };

  // =========================================================
  // CORRECT ANSWER
  // =========================================================

  const handleCorrectAnswerChange = (
    questionIndex,
    optionIndex,
  ) => {
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

    setError("");
  };

  // =========================================================
  // ADD / REMOVE QUESTION
  // =========================================================

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      createEmptyQuestion(),
    ]);

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const removeQuestion = (indexToRemove) => {
    if (questions.length === 1) {
      setError(
        "A quiz must contain at least one question.",
      );
      return;
    }

    setQuestions((prev) =>
      prev.filter(
        (_, index) => index !== indexToRemove,
      ),
    );

    setError("");
  };

  // =========================================================
  // COMPLETED QUESTIONS
  // =========================================================

  const getCompletedQuestionCount = () => {
    return questions.filter(
      (question) =>
        question.question.trim() &&
        question.questionHindi.trim() &&
        question.options.every(
          (option) =>
            option.english.trim() &&
            option.hindi.trim(),
        ),
    ).length;
  };

  // =========================================================
  // CSV IMPORT
  // =========================================================

  const handleImportCSV = () => {
    setError("");
    setImportMessage("");

    fileInputRef.current?.click();
  };

  const handleCSVFileChange = async (event) => {
    const file = event.target.files?.[0];

    // Allows selecting the same file again.
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setImportMessage("");
    setImporting(true);

    try {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a CSV file.");
        return;
      }

      const text = await file.text();

      if (!text.trim()) {
        setError("The CSV file is empty.");
        return;
      }

      const lines = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .filter((line) => line.trim());

      if (lines.length < 2) {
        setError(
          "The CSV must contain a header row and at least one question.",
        );
        return;
      }

      // =====================================================
      // HEADER VALIDATION
      // =====================================================

      const headers = parseCSVLine(lines[0]);

      if (headers.length !== EXPECTED_HEADERS.length) {
        setError(
          `Invalid CSV format. Expected ${EXPECTED_HEADERS.length} columns, but found ${headers.length}.`,
        );
        return;
      }

      const normalizedHeaders = headers.map(
        normalizeHeader,
      );

      const normalizedExpected = EXPECTED_HEADERS.map(
        normalizeHeader,
      );

      const headersAreValid =
        normalizedExpected.every(
          (header, index) =>
            normalizedHeaders[index] === header,
        );

      if (!headersAreValid) {
        setError(
          "Invalid CSV columns. Please use the Quizzy CSV template format.",
        );
        return;
      }

      // =====================================================
      // PARSE QUESTIONS
      // =====================================================

      const importedQuestions = [];
      const errors = [];
      const questionSet = new Set();

      for (
        let rowIndex = 1;
        rowIndex < lines.length;
        rowIndex++
      ) {
        const rowNumber = rowIndex + 1;

        const values = parseCSVLine(
          lines[rowIndex],
        ).map(cleanCSVValue);

        if (
          values.every((value) => !value)
        ) {
          continue;
        }

        if (
          values.length !==
          EXPECTED_HEADERS.length
        ) {
          errors.push(
            `Row ${rowNumber}: Expected 11 columns but found ${values.length}.`,
          );
          continue;
        }

        // ---------------------------------------------------
        // Question
        // ---------------------------------------------------

        const questionEnglish = values[0];
        const questionHindi = values[1];

        if (!questionEnglish) {
          errors.push(
            `Row ${rowNumber}: English question is empty.`,
          );
          continue;
        }

        if (!questionHindi) {
          errors.push(
            `Row ${rowNumber}: Hindi question is empty.`,
          );
          continue;
        }

        // ---------------------------------------------------
        // Options
        // ---------------------------------------------------

        const options = [
          {
            english: values[2],
            hindi: values[3],
          },
          {
            english: values[4],
            hindi: values[5],
          },
          {
            english: values[6],
            hindi: values[7],
          },
          {
            english: values[8],
            hindi: values[9],
          },
        ];

        const emptyOptionIndex =
          options.findIndex(
            (option) =>
              !option.english ||
              !option.hindi,
          );

        if (emptyOptionIndex !== -1) {
          errors.push(
            `Row ${rowNumber}: Option ${String.fromCharCode(
              65 + emptyOptionIndex,
            )} is incomplete.`,
          );
          continue;
        }

        // ---------------------------------------------------
        // Correct answer
        // ---------------------------------------------------

        const correctAnswer = getAnswerIndex(
          values[10],
        );

        if (correctAnswer === -1) {
          errors.push(
            `Row ${rowNumber}: Answer must be A, B, C or D. Found "${values[10]}".`,
          );
          continue;
        }

        // ---------------------------------------------------
        // Duplicate question
        // ---------------------------------------------------

        const duplicateKey = questionEnglish
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        if (questionSet.has(duplicateKey)) {
          errors.push(
            `Row ${rowNumber}: Duplicate question.`,
          );
          continue;
        }

        questionSet.add(duplicateKey);

        // ---------------------------------------------------
        // Add question
        // ---------------------------------------------------

        importedQuestions.push({
          question: questionEnglish,
          questionHindi,
          options,
          correctAnswer,
        });
      }

      // =====================================================
      // NO VALID QUESTIONS
      // =====================================================

      if (importedQuestions.length === 0) {
        setError(
          errors.length > 0
            ? `No valid questions were found.\n\n${errors
                .slice(0, 10)
                .join("\n")}${
                errors.length > 10
                  ? "\n..."
                  : ""
              }`
            : "No valid questions were found in the CSV.",
        );

        return;
      }

      // =====================================================
      // IMPORT
      // =====================================================

      setQuestions(importedQuestions);

      setImportMessage(
        `Successfully imported ${importedQuestions.length} question${
          importedQuestions.length !== 1
            ? "s"
            : ""
        }.`,
      );

      if (errors.length > 0) {
        setError(
          `${errors.length} row${
            errors.length !== 1
              ? "s"
              : ""
          } skipped during import.\n\n${errors
            .slice(0, 10)
            .join("\n")}${
            errors.length > 10
              ? "\n..."
              : ""
          }`,
        );
      }

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 150);
    } catch (error) {
      console.error(
        "CSV import error:",
        error,
      );

      setError(
        "Unable to read the CSV file. Please make sure it is a valid CSV file.",
      );
    } finally {
      setImporting(false);
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError(
        "Please enter a quiz title.",
      );
      return;
    }

    if (Number(formData.duration) < 1) {
      setError(
        "Quiz duration must be at least 1 minute.",
      );
      return;
    }

    if (Number(formData.positiveMarks) < 0) {
      setError(
        "Positive marks cannot be negative.",
      );
      return;
    }

    if (Number(formData.negativeMarks) < 0) {
      setError(
        "Negative marks cannot be negative.",
      );
      return;
    }

    if (questions.length === 0) {
      setError(
        "Please add at least one question.",
      );
      return;
    }

    // =====================================================
    // Validate every question
    // =====================================================

    for (
      let i = 0;
      i < questions.length;
      i++
    ) {
      const question = questions[i];

      if (!question.question.trim()) {
        setError(
          `Please enter Question ${i + 1} in English.`,
        );
        return;
      }

      if (!question.questionHindi.trim()) {
        setError(
          `Please enter Question ${i + 1} in Hindi.`,
        );
        return;
      }

      for (
        let j = 0;
        j < question.options.length;
        j++
      ) {
        const option =
          question.options[j];

        if (!option.english.trim()) {
          setError(
            `Please fill English Option ${String.fromCharCode(
              65 + j,
            )} in Question ${i + 1}.`,
          );
          return;
        }

        if (!option.hindi.trim()) {
          setError(
            `Please fill Hindi Option ${String.fromCharCode(
              65 + j,
            )} in Question ${i + 1}.`,
          );
          return;
        }
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >=
          question.options.length
      ) {
        setError(
          `Please select a correct answer for Question ${
            i + 1
          }.`,
        );
        return;
      }
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/quizzes",
        {
          title: formData.title.trim(),

          description:
            formData.description.trim(),

          duration: Number(
            formData.duration,
          ),

          positiveMarks: Number(
            formData.positiveMarks,
          ),

          negativeMarks: Number(
            formData.negativeMarks,
          ),

          questions,
        },
      );

      const shareCode =
        response.data.quiz.shareCode;

      navigate(
        `/admin?created=${shareCode}`,
      );
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

  const completedQuestions =
    getCompletedQuestionCount();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hidden CSV input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleCSVFileChange}
        className="hidden"
      />

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
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

      <main className="mx-auto max-w-5xl px-5 py-8 pb-32 sm:py-10">
        {/* Header */}
        <header>
          <p className="text-sm font-semibold text-slate-500">
            Admin Panel
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create Quiz
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Configure your quiz, set the marking scheme, and add your questions.
          </p>
        </header>

        {/* Quiz Summary */}
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
            <span className="text-xs text-slate-500">
              Negative marking
            </span>

            <span className="text-xs font-bold text-slate-900">
              {Number(formData.negativeMarks) === 0
                ? "None"
                : `-${formData.negativeMarks}`}
            </span>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6"
        >
          {/* =================================================
              QUIZ DETAILS
          ================================================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Quiz Details
              </h2>

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
                  placeholder="e.g. Rajasthan GK"
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
                  value={
                    formData.description
                  }
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
                    value={
                      formData.positiveMarks
                    }
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

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
                    value={
                      formData.negativeMarks
                    }
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="0">
                      No Negative Marking
                    </option>

                    <option value="0.25">
                      1/4 mark
                    </option>

                    <option value="0.33">
                      1/3 mark
                    </option>

                    <option value="0.5">
                      1/2 mark
                    </option>

                    <option value="0.75">
                      3/4 mark
                    </option>

                    <option value="1">
                      1 mark
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              QUESTIONS
          ================================================= */}
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Questions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {completedQuestions} of{" "}
                  {questions.length} completed
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                {questions.length}
              </span>
            </div>

            {/* =================================================
                CSV IMPORT
            ================================================= */}
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Import questions from CSV
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Import English + Hindi questions and options in bulk.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleImportCSV}
                  disabled={importing}
                  className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing
                    ? "Importing..."
                    : "📄 Import CSV"}
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-[11px] leading-5 text-slate-500">
                  Expected columns:
                </p>

                <p className="mt-1 text-[11px] leading-5 font-medium text-slate-700">
                  Question English, Question Hindi, A English, A Hindi, B English, B Hindi, C English, C Hindi, D English, D Hindi, Answer
                </p>
              </div>

              {importMessage && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {importMessage}
                </div>
              )}
            </div>

            {/* =================================================
                QUESTION CARDS
            ================================================= */}
            <div className="mt-5 space-y-5">
              {questions.map(
                (question, questionIndex) => {
                  const isComplete =
                    question.question.trim() &&
                    question.questionHindi.trim() &&
                    question.options.every(
                      (option) =>
                        option.english.trim() &&
                        option.hindi.trim(),
                    );

                  return (
                    <div
                      key={questionIndex}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      {/* Header */}
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
                              Question{" "}
                              {questionIndex + 1}
                            </h3>

                            <p className="text-[11px] text-slate-400">
                              {isComplete
                                ? "Ready"
                                : "Incomplete"}
                            </p>
                          </div>
                        </div>

                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeQuestion(
                                questionIndex,
                              )
                            }
                            className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* =================================================
                          QUESTION ENGLISH
                      ================================================= */}
                      <div className="mt-5">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Question — English
                        </label>

                        <textarea
                          value={question.question}
                          onChange={(e) =>
                            handleQuestionChange(
                              questionIndex,
                              e.target.value,
                            )
                          }
                          placeholder="Enter question in English..."
                          rows={3}
                          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>

                      {/* =================================================
                          QUESTION HINDI
                      ================================================= */}
                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Question — Hindi
                        </label>

                        <textarea
                          value={
                            question.questionHindi
                          }
                          onChange={(e) =>
                            handleQuestionHindiChange(
                              questionIndex,
                              e.target.value,
                            )
                          }
                          placeholder="हिंदी में प्रश्न दर्ज करें..."
                          rows={3}
                          className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>

                      {/* =================================================
                          OPTIONS
                      ================================================= */}
                      <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Options
                          </label>

                          <span className="text-[11px] text-slate-400">
                            Select the correct answer below
                          </span>
                        </div>

                        <div className="space-y-5">
                          {question.options.map(
                            (
                              option,
                              optionIndex,
                            ) => {
                              const isCorrect =
                                question.correctAnswer ===
                                optionIndex;

                              const letter =
                                String.fromCharCode(
                                  65 +
                                    optionIndex,
                                );

                              return (
                                <div
                                  key={
                                    optionIndex
                                  }
                                  className="rounded-xl border border-slate-200 p-4"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                        isCorrect
                                          ? "bg-slate-900 text-white"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {letter}
                                    </div>

                                    <span className="text-sm font-bold text-slate-700">
                                      Option{" "}
                                      {letter}
                                    </span>
                                  </div>

                                  {/* English */}
                                  <div className="mt-4">
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                                      English
                                    </label>

                                    <input
                                      type="text"
                                      value={
                                        option.english
                                      }
                                      onChange={(
                                        e,
                                      ) =>
                                        handleOptionChange(
                                          questionIndex,
                                          optionIndex,
                                          "english",
                                          e.target
                                            .value,
                                        )
                                      }
                                      placeholder={`Option ${letter} in English`}
                                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                    />
                                  </div>

                                  {/* Hindi */}
                                  <div className="mt-3">
                                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                                      Hindi
                                    </label>

                                    <input
                                      type="text"
                                      value={
                                        option.hindi
                                      }
                                      onChange={(
                                        e,
                                      ) =>
                                        handleOptionChange(
                                          questionIndex,
                                          optionIndex,
                                          "hindi",
                                          e.target
                                            .value,
                                        )
                                      }
                                      placeholder={`Option ${letter} in Hindi`}
                                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                    />
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>

                      {/* =================================================
                          CORRECT ANSWER
                      ================================================= */}
                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Correct Answer
                        </label>

                        <select
                          value={
                            question.correctAnswer
                          }
                          onChange={(e) =>
                            handleCorrectAnswerChange(
                              questionIndex,
                              Number(
                                e.target.value,
                              ),
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        >
                          {question.options.map(
                            (
                              option,
                              optionIndex,
                            ) => (
                              <option
                                key={
                                  optionIndex
                                }
                                value={
                                  optionIndex
                                }
                              >
                                Option{" "}
                                {String.fromCharCode(
                                  65 +
                                    optionIndex,
                                )}
                                {" — "}
                                {option.english ||
                                  "Empty"}
                              </option>
                            ),
                          )}
                        </select>

                        <p className="mt-2 text-xs text-slate-400">
                          Selected answer:{" "}
                          <span className="font-semibold text-slate-700">
                            {String.fromCharCode(
                              65 +
                                question.correctAnswer,
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {/* Add Question */}
            <button
              type="button"
              onClick={addQuestion}
              className="mt-5 w-full rounded-xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99]"
            >
              + Add Question
            </button>
          </section>

          {/* =================================================
              ERROR
          ================================================= */}
          {error && (
            <div className="whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              SUBMIT
          ================================================= */}
          <div className="sticky bottom-4 z-20">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Quiz..."
                  : "Create Quiz"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateQuiz;