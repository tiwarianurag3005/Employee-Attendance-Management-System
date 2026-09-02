const Leave = require("../models/Leave");
const User = require("../models/User");

const applyLeave = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        const {
            leaveType,
            startDate,
            endDate,
            reason
        } = req.body;

        // Check required fields
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({
                message: "All leave fields are required"
            });
        }

        // Validate leave type
        if (!["CASUAL", "SICK", "PAID"].includes(leaveType)) {
            return res.status(400).json({
                message: "Invalid leave type"
            });
        }

        // Convert dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid date provided"
            });
        }

        // Validate past date (Cannot apply for past dates)
        const todayStr = new Date().toISOString().split("T")[0];
        const todayDate = new Date(todayStr);

        if (start < todayDate) {
            return res.status(400).json({
                message: "You cannot apply for leave on past dates"
            });
        }

        // Validate date order
        if (start > end) {
            return res.status(400).json({
                message: "Start date cannot be after end date"
            });
        }

        // Check Overlapping Leaves (Prevents duplicate requests for the same date range)
        const overlappingLeave = await Leave.findOne({
            employee: employeeId,
            status: { $in: ["PENDING", "APPROVED"] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlappingLeave) {
            return res.status(400).json({
                message: "You already have a pending or approved leave in this date range"
            });
        }

        // Calculate number of days
        const difference = end.getTime() - start.getTime();
        const numberOfDays = Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;

        // Find employee & Check leave balance
        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const balanceKey = leaveType.toLowerCase();
        const availableLeave = employee.leaveBalance?.[balanceKey] ?? 0;

        if (availableLeave < numberOfDays) {
            return res.status(400).json({
                message: `Insufficient ${leaveType.toLowerCase()} leave balance (Required: ${numberOfDays}, Available: ${availableLeave})`
            });
        }

        // Create leave request
        const leave = await Leave.create({
            employee: employeeId,
            leaveType,
            startDate: start,
            endDate: end,
            numberOfDays,
            reason: reason.trim(),
            status: "PENDING"
        });

        res.status(201).json({
            message: "Leave application submitted successfully",
            leave
        });

    } catch (error) {
        console.error("Apply leave error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { status } = req.body;

        // Validate status
        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Status must be APPROVED or REJECTED"
            });
        }

        // Find leave request
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({
                message: "Leave request not found"
            });
        }

        // Prevent updating already processed request
        if (leave.status !== "PENDING") {
            return res.status(400).json({
                message: "Leave request has already been processed"
            });
        }

        // If HR approves the leave
        if (status === "APPROVED") {
            const employee = await User.findById(leave.employee);
            if (!employee) {
                return res.status(404).json({
                    message: "Employee not found"
                });
            }

            const balanceKey = leave.leaveType.toLowerCase();
            const availableLeave = employee.leaveBalance?.[balanceKey] ?? 0;

            // Check balance again before deduction
            if (availableLeave < leave.numberOfDays) {
                return res.status(400).json({
                    message: "Employee does not have enough leave balance"
                });
            }

            // Deduct leave
            employee.leaveBalance[balanceKey] = availableLeave - leave.numberOfDays;
            await employee.save();
        }

        // Update leave status
        leave.status = status;
        await leave.save();

        res.status(200).json({
            message: `Leave request ${status.toLowerCase()} successfully`,
            leave
        });

    } catch (error) {
        console.error("Update leave status error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    applyLeave,
    updateLeaveStatus
};
