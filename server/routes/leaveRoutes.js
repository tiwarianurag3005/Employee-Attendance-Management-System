const express = require("express");

const {
    applyLeave,
    updateLeaveStatus
} = require("../controllers/leaveController");

const protect = require("../middleware/authMiddleware");
const hrOnly = require("../middleware/hrMiddleware");

const router = express.Router();

// Employee Apply Leave
router.post("/apply", protect, applyLeave);

// HR Approve / Reject Leave
router.patch(
    "/:leaveId/status",
    protect,
    hrOnly,
    updateLeaveStatus
);

module.exports = router;