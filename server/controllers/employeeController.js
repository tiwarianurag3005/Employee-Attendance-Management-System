const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");


// Get Employee Dashboard
const getEmployeeDashboard = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        // Find employee
        const employee = await User.findById(employeeId).select(
            "-password"
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        // Today's date
        const today = new Date()
            .toISOString()
            .split("T")[0];

        // Today's attendance
        const todayAttendance = await Attendance.findOne({
            employee: employeeId,
            date: today
        });

        // Attendance history
        const attendanceHistory = await Attendance.find({
            employee: employeeId
        })
            .sort({ date: -1 })
            .limit(10);

        // Leave history
        const leaveHistory = await Leave.find({
            employee: employeeId
        })
            .sort({ createdAt: -1 })
            .limit(10);

        // Dashboard response
        res.status(200).json({
            message: "Employee dashboard fetched successfully",

            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                department: employee.department,
                role: employee.role
            },

            leaveBalance: employee.leaveBalance,

            todayAttendance: todayAttendance || null,

            attendanceHistory,

            leaveHistory
        });

    } catch (error) {
        console.error(
            "Employee dashboard error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getEmployeeDashboard
};