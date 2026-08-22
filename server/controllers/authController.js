const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

const register = async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;

        if (!username || !password || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match.",
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                message: "Username must be at least 3 characters.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters.",
            });
        }

        const existingUser = await User.findOne({
            username: username.toLowerCase(),
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            username: username.toLowerCase(),
            password: hashedPassword,
        });

        const token = generateToken(user);

        res.status(201).json({
            message: "Account created successfully.",
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Something went wrong.",
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required.",
            });
        }

        const user = await User.findOne({
            username: username.toLowerCase(),
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password.",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password.",
            });
        }

        const token = generateToken(user);

        res.json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Something went wrong.",
        });
    }
};

const getMe = async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role,
            createdAt: req.user.createdAt,
        },
    });
};

module.exports = {
    register,
    login,
    getMe,
};