const express = require("express");
const cors = require("cors");
const compression = require("compression");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Health / status routes
app.get("/", (req, res) => {
    res.json({
        message: "Quizzy API is running!",
    });
});

app.get("/healthz", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);

// Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `Quizzy server running on port ${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();