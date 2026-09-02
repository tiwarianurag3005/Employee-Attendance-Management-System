const express = require("express");

const {
    checkIn,
    checkOut,
    getMyAttendance
} = require("../controllers/attendanceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Employee Check-In
router.post("/check-in", protect, checkIn);

// Employee Check-Out
router.post("/check-out", protect, checkOut);

// Get Employee Attendance
router.get("/my-attendance", protect, getMyAttendance);

module.exports = router;