import { useState } from "react";

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

const normalizeQuestion = (question) => ({
    question: question?.question || "",
    questionHindi: question?.questionHindi || "",

    options: Array.from({ length: 4 }, (_, index) => {
        const option = question?.options?.[index];

        // Support old quizzes where options were plain strings
        if (typeof option === "string") {
            return {
                english: option,
                hindi: "",
            };
        }

        return {
            english: option?.english || "",
            hindi: option?.hindi || "",
        };
    }),

    correctAnswer:
        typeof question?.correctAnswer === "number"
            ? question.correctAnswer
            : 0,
});

function QuizBuilder({
    initialData = null,
    onSubmit,
    submitText = "Create Quiz",
    loading = false,
}) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        duration: initialData?.duration || 30,
        positiveMarks: initialData?.positiveMarks ?? 1,
        negativeMarks: initialData?.negativeMarks ?? 0,
    });

    const [questions, setQuestions] = useState(
        initialData?.questions?.length
            ? initialData.questions.map(normalizeQuestion)
            : [createEmptyQuestion()]
    );

    const [error, setError] = useState("");

    const handleQuizChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

        setError("");
    };

    const handleQuestionChange = (index, value) => {
        setQuestions((prev) =>
            prev.map((question, questionIndex) =>
                questionIndex === index
                    ? {
                          ...question,
                          question: value,
                      }
                    : question
            )
        );

        setError("");
    };

    const handleQuestionHindiChange = (
        index,
        value
    ) => {
        setQuestions((prev) =>
            prev.map((question, questionIndex) =>
                questionIndex === index
                    ? {
                          ...question,
                          questionHindi: value,
                      }
                    : question
            )
        );

        setError("");
    };

    const handleOptionChange = (
        questionIndex,
        optionIndex,
        language,
        value
    ) => {
        setQuestions((prev) =>
            prev.map((question, index) => {
                if (index !== questionIndex) {
                    return question;
                }

                const options = question.options.map(
                    (option, currentIndex) => {
                        if (
                            currentIndex !== optionIndex
                        ) {
                            return option;
                        }

                        return {
                            ...option,
                            [language]: value,
                        };
                    }
                );

                return {
                    ...question,
                    options,
                };
            })
        );

        setError("");
    };

    const handleCorrectAnswerChange = (
        questionIndex,
        value
    ) => {
        setQuestions((prev) =>
            prev.map((question, index) =>
                index === questionIndex
                    ? {
                          ...question,
                          correctAnswer: Number(value),
                      }
                    : question
            )
        );

        setError("");
    };

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

    const removeQuestion = (index) => {
        if (questions.length === 1) {
            return;
        }

        setQuestions((prev) =>
            prev.filter(
                (_, questionIndex) =>
                    questionIndex !== index
            )
        );

        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setError("");

        if (!formData.title.trim()) {
            setError("Please enter a quiz title.");
            return;
        }

        if (Number(formData.duration) < 1) {
            setError(
                "Duration must be at least 1 minute."
            );
            return;
        }

        if (Number(formData.positiveMarks) < 0) {
            setError(
                "Correct marks cannot be negative."
            );
            return;
        }

        if (Number(formData.negativeMarks) < 0) {
            setError(
                "Negative marks cannot be negative."
            );
            return;
        }

        if (questions.length === 0) {
            setError(
                "Please add at least one question."
            );
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            if (!question.question.trim()) {
                setError(
                    `Please enter Question ${i + 1} in English.`
                );
                return;
            }

            if (!question.questionHindi.trim()) {
                setError(
                    `Please enter Question ${i + 1} in Hindi.`
                );
                return;
            }

            if (
                !Array.isArray(question.options) ||
                question.options.length !== 4
            ) {
                setError(
                    `Question ${i + 1} must have 4 options.`
                );
                return;
            }

            for (
                let j = 0;
                j < question.options.length;
                j++
            ) {
                const option = question.options[j];

                if (
                    !option ||
                    !option.english?.trim()
                ) {
                    setError(
                        `Please fill English text for Option ${String.fromCharCode(
                            65 + j
                        )} in Question ${i + 1}.`
                    );
                    return;
                }

                if (
                    !option.hindi?.trim()
                ) {
                    setError(
                        `Please fill Hindi text for Option ${String.fromCharCode(
                            65 + j
                        )} in Question ${i + 1}.`
                    );
                    return;
                }
            }

            if (
                typeof question.correctAnswer !==
                    "number" ||
                question.correctAnswer < 0 ||
                question.correctAnswer > 3
            ) {
                setError(
                    `Please select a correct answer for Question ${
                        i + 1
                    }.`
                );
                return;
            }
        }

        onSubmit({
            title: formData.title.trim(),

            description:
                formData.description.trim(),

            duration: Number(formData.duration),

            positiveMarks: Number(
                formData.positiveMarks
            ),

            negativeMarks: Number(
                formData.negativeMarks
            ),

            questions: questions.map((question) => ({
                question: question.question.trim(),

                questionHindi:
                    question.questionHindi.trim(),

                options: question.options.map(
                    (option) => ({
                        english:
                            option.english.trim(),

                        hindi:
                            option.hindi.trim(),
                    })
                ),

                correctAnswer:
                    question.correctAnswer,
            })),
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Quiz Details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                    Quiz Details
                </h2>

                <div className="mt-5 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Quiz Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleQuizChange}
                            maxLength={100}
                            placeholder="e.g. Rajasthan CET"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Description
                            <span className="ml-1 font-normal text-slate-400">
                                (Optional)
                            </span>
                        </label>

                        <textarea
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={handleQuizChange}
                            rows={3}
                            maxLength={500}
                            placeholder="Describe your quiz..."
                            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Duration
                            </label>

                            <div className="relative">
                                <input
                                    type="number"
                                    name="duration"
                                    min="1"
                                    value={
                                        formData.duration
                                    }
                                    onChange={
                                        handleQuizChange
                                    }
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-16 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                />

                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                    minutes
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Correct Marks
                            </label>

                            <input
                                type="number"
                                name="positiveMarks"
                                min="0"
                                step="0.25"
                                value={
                                    formData.positiveMarks
                                }
                                onChange={
                                    handleQuizChange
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Negative Marks
                            </label>

                            <select
                                name="negativeMarks"
                                value={
                                    formData.negativeMarks
                                }
                                onChange={
                                    handleQuizChange
                                }
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

            {/* Questions */}
            <section>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Questions
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {questions.length} question
                        {questions.length !== 1
                            ? "s"
                            : ""}
                    </p>
                </div>

                <div className="mt-5 space-y-5">
                    {questions.map(
                        (
                            question,
                            questionIndex
                        ) => (
                            <div
                                key={questionIndex}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900">
                                        Question{" "}
                                        {questionIndex +
                                            1}
                                    </h3>

                                    {questions.length >
                                        1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeQuestion(
                                                    questionIndex
                                                )
                                            }
                                            className="text-sm font-medium text-red-500 hover:text-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                {/* English Question */}
                                <div className="mt-4">
                                    <label className="mb-2 block text-xs font-medium text-slate-500">
                                        Question (English)
                                    </label>

                                    <textarea
                                        value={
                                            question.question
                                        }
                                        onChange={(e) =>
                                            handleQuestionChange(
                                                questionIndex,
                                                e.target
                                                    .value
                                            )
                                        }
                                        rows={3}
                                        placeholder="Enter your question in English..."
                                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                    />
                                </div>

                                {/* Hindi Question */}
                                <div className="mt-4">
                                    <label className="mb-2 block text-xs font-medium text-slate-500">
                                        Question (Hindi)
                                    </label>

                                    <textarea
                                        value={
                                            question.questionHindi
                                        }
                                        onChange={(e) =>
                                            handleQuestionHindiChange(
                                                questionIndex,
                                                e.target
                                                    .value
                                            )
                                        }
                                        rows={3}
                                        placeholder="हिंदी में प्रश्न लिखें..."
                                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                    />
                                </div>

                                {/* Options */}
                                <div className="mt-5 space-y-4">
                                    {question.options.map(
                                        (
                                            option,
                                            optionIndex
                                        ) => (
                                            <div
                                                key={
                                                    optionIndex
                                                }
                                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <label className="mb-3 block text-sm font-semibold text-slate-700">
                                                    Option{" "}
                                                    {String.fromCharCode(
                                                        65 +
                                                            optionIndex
                                                    )}
                                                </label>

                                                {/* English Option */}
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-medium text-slate-500">
                                                        English
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={
                                                            option.english
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleOptionChange(
                                                                questionIndex,
                                                                optionIndex,
                                                                "english",
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder={`Enter Option ${String.fromCharCode(
                                                            65 +
                                                                optionIndex
                                                        )} in English`}
                                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                                    />
                                                </div>

                                                {/* Hindi Option */}
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
                                                            e
                                                        ) =>
                                                            handleOptionChange(
                                                                questionIndex,
                                                                optionIndex,
                                                                "hindi",
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder={`विकल्प ${String.fromCharCode(
                                                            65 +
                                                                optionIndex
                                                        )} हिंदी में लिखें`}
                                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Correct Answer */}
                                <div className="mt-5">
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Correct Answer
                                    </label>

                                    <select
                                        value={
                                            question.correctAnswer
                                        }
                                        onChange={(e) =>
                                            handleCorrectAnswerChange(
                                                questionIndex,
                                                e.target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                                    >
                                        {question.options.map(
                                            (
                                                _,
                                                optionIndex
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
                                                            optionIndex
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>
                        )
                    )}
                </div>

                <button
                    type="button"
                    onClick={addQuestion}
                    className="mt-5 w-full rounded-xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    + Add Question
                </button>
            </section>

            {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="sticky bottom-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "Saving..."
                        : submitText}
                </button>
            </div>
        </form>
    );
}

export default QuizBuilder;