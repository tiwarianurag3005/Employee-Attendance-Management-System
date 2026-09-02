// server/controllers/hrController.js

const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

// 1. Get all employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await User.find(
            { role: "EMPLOYEE" },
            { name: 1, email: 1, department: 1, leaveBalance: 1, createdAt: 1 }
        ).sort({ name: 1 });

        res.status(200).json({
            message: "Employees fetched successfully",
            count: employees.length,
            employees
        });
    } catch (error) {
        console.error("Get employees error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// 2. Get Dashboard Statistics + Pending Leaves
const getDashboardStats = async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments({ role: "EMPLOYEE" });
        const today = new Date().toISOString().split("T")[0];
        const todayAttendance = await Attendance.find({ date: today }).populate("employee");

        // Filter only existing employees
        const validTodayAttendance = todayAttendance.filter(a => a.employee && a.employee.role === "EMPLOYEE");

        const presentToday = validTodayAttendance.filter((a) => a.status === "PRESENT").length;
        const halfDayToday = validTodayAttendance.filter((a) => a.status === "HALF_DAY").length;

        const startOfToday = new Date(today);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        const approvedLeaves = await Leave.find({
            status: "APPROVED",
            startDate: { $lte: endOfToday },
            endDate: { $gte: startOfToday }
        }).populate("employee");

        const validApprovedLeaves = approvedLeaves.filter(l => l.employee && l.employee.role === "EMPLOYEE");
        const onLeaveToday = validApprovedLeaves.length;
        const absentToday = Math.max(0, totalEmployees - presentToday - halfDayToday - onLeaveToday);

        const pendingLeaves = await Leave.find({ status: "PENDING" })
            .populate({
                path: "employee",
                match: { role: "EMPLOYEE" },
                select: "name email department role"
            })
            .sort({ createdAt: -1 });

        const filteredPendingLeaves = pendingLeaves.filter(leave => leave.employee !== null);

        res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            statistics: { totalEmployees, presentToday, halfDayToday, absentToday, onLeaveToday },
            pendingLeaves: filteredPendingLeaves
        });
    } catch (error) {
        console.error("Dashboard statistics error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// 3. Get all attendance (Filters out deleted employees & auto-fills status for active staff)
const getAllAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        // Fetch active employees
        const activeEmployees = await User.find({ role: "EMPLOYEE" }).select("name email department").lean();
        const activeEmployeeIds = activeEmployees.map(e => e._id.toString());

        // Fetch actual DB records and populate
        const dbAttendance = await Attendance.find()
            .populate("employee", "name email department role")
            .sort({ date: -1, createdAt: -1 })
            .lean();

        // 1. FILTER: Only keep records for ACTIVE employees
        const validDbAttendance = dbAttendance.filter(
            a => a.employee && activeEmployeeIds.includes(a.employee._id.toString())
        );

        // Fetch today's approved leaves
        const startOfToday = new Date(today);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        const approvedLeaves = await Leave.find({
            status: "APPROVED",
            startDate: { $lte: endOfToday },
            endDate: { $gte: startOfToday }
        }).lean();

        // Check which active employees have attendance for today
        const todayDbEmployeeIds = validDbAttendance
            .filter(a => a.date === today)
            .map(a => a.employee._id.toString());

        const syntheticTodayRecords = [];

        // For active employees with NO record today, create auto LEAVE / ABSENT entry
        activeEmployees.forEach(emp => {
            const empIdStr = emp._id.toString();
            if (!todayDbEmployeeIds.includes(empIdStr)) {
                const isOnLeave = approvedLeaves.some(
                    l => l.employee && l.employee.toString() === empIdStr
                );

                syntheticTodayRecords.push({
                    _id: `auto_${empIdStr}`,
                    employee: emp,
                    date: today,
                    checkIn: null,
                    checkOut: null,
                    workingHours: 0,
                    status: isOnLeave ? "LEAVE" : "ABSENT"
                });
            }
        });

        // Combine synthetic records for today + valid past logs
        const finalAttendance = [...syntheticTodayRecords, ...validDbAttendance];

        res.status(200).json({
            message: "All attendance fetched successfully",
            count: finalAttendance.length,
            attendance: finalAttendance
        });
    } catch (error) {
        console.error("Get all attendance error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 4. Delete Employee (Cascade Delete)
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.userId) {
            return res.status(400).json({ message: "HR cannot delete their own account" });
        }

        const employee = await User.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        await Attendance.deleteMany({ employee: id });
        await Leave.deleteMany({ employee: id });
        await User.findByIdAndDelete(id);

        res.status(200).json({ message: "Employee and associated records deleted successfully" });
    } catch (error) {
        console.error("Delete employee error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllEmployees,
    getDashboardStats,
    getAllAttendance,
    deleteEmployee
};