const protect = require("./middleware/authMiddleware");
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const User = require("./models/User");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const hrRoutes = require("./routes/hrRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/employee", employeeRoutes);

// Protected test route
app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route!",
        user: req.user
    });
});


// MONTHLY LEAVE RENEWAL CRON JOB
// Runs at 00:00 (Midnight) on 1st of every month

const MONTHLY_LEAVE_QUOTA = {
    casual: 2,
    sick: 1,
    paid: 1,
};

cron.schedule("0 0 1 * *", async () => {
    console.log("Running Monthly Leave Balance Renewal...");
    try {
        const result = await User.updateMany(
            { role: "EMPLOYEE" },
            {
                $inc: {
                    "leaveBalance.casual": MONTHLY_LEAVE_QUOTA.casual,
                    "leaveBalance.sick": MONTHLY_LEAVE_QUOTA.sick,
                    "leaveBalance.paid": MONTHLY_LEAVE_QUOTA.paid,
                },
            }
        );
        console.log(`Leave balances renewed for ${result.modifiedCount} employees.`);
    } catch (error) {
        console.error("Leave Renewal Error:", error.message);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});