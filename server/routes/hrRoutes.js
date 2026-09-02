const express = require("express");

const {
    getAllEmployees,
    getDashboardStats,
    getAllAttendance,
    deleteEmployee
} = require("../controllers/hrController");

const protect = require("../middleware/authMiddleware");
const hrOnly = require("../middleware/hrMiddleware");

const router = express.Router();

// Get all employees
router.get(
    "/employees",
    protect,
    hrOnly,
    getAllEmployees
);

// HR Dashboard Statistics
router.get(
    "/dashboard",
    protect,
    hrOnly,
    getDashboardStats
);

// Get all attendance
router.get(
    "/attendance",
    protect,
    hrOnly,
    getAllAttendance
);

// Delete employee (HR Only)
router.delete(
    "/employee/:id",
    protect,
    hrOnly,
    deleteEmployee
);

module.exports = router;