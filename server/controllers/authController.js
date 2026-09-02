const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER USER

const registerUser = async (req, res) => {
    try {
        const { name, email, password, department, role } = req.body;

        // 1. Check required fields
        if (!name || !email || !password || !department) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // 3. Password Strength Validations
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one uppercase letter (A-Z)"
            });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least one special character (!@#$%^&*)"
            });
        }

        // 4. Validate Role (Default to EMPLOYEE if not provided or invalid)
        const userRole = (role && ["EMPLOYEE", "HR"].includes(role)) ? role : "EMPLOYEE";

        // 5. Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered. Please use another email or log in."
            });
        }

        // 6. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. Create user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            department,
            role: userRole
        });

        res.status(201).json({
            message: `${userRole === "HR" ? "HR" : "Employee"} registered successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// LOGIN USER

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};
