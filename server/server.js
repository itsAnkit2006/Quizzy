const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Quizzy API is running!",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Quizzy server running on port ${PORT}`);
});