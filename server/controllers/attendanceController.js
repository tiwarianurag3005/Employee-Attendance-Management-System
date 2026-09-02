const Attendance = require("../models/Attendance");

const checkIn = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        const today = new Date().toISOString().split("T")[0];

        // Check if already checked in today
        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: today
        });

        if (existingAttendance) {
            return res.status(400).json({
                message: "You have already checked in today"
            });
        }

        // Create attendance
        const attendance = await Attendance.create({
            employee: employeeId,
            date: today,
            checkIn: new Date(),
            status: "PRESENT"
        });

        res.status(201).json({
            message: "Check-in successful",
            attendance
        });

    } catch (error) {
        console.error("Check-in error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const checkOut = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        const today = new Date().toISOString().split("T")[0];

        // Find today's attendance
        const attendance = await Attendance.findOne({
            employee: employeeId,
            date: today
        });

        // Check if employee checked in
        if (!attendance) {
            return res.status(400).json({
                message: "You have not checked in today"
            });
        }

        // Check if already checked out
        if (attendance.checkOut) {
            return res.status(400).json({
                message: "You have already checked out today"
            });
        }

        // Current checkout time
        const checkOutTime = new Date();

        // Calculate working time in milliseconds
        const workingTime =
            checkOutTime.getTime() - attendance.checkIn.getTime();

        // Convert milliseconds to hours
        const workingHours =
            workingTime / (1000 * 60 * 60);

        // Update attendance
        attendance.checkOut = checkOutTime;
        attendance.workingHours = Number(workingHours.toFixed(2));

        // Determine attendance status
        if (workingHours >= 8) {
            attendance.status = "PRESENT";
        } else if (workingHours >= 4) {
            attendance.status = "HALF_DAY";
        } else {
            attendance.status = "ABSENT";
        }

        await attendance.save();

        res.status(200).json({
            message: "Check-out successful",
            attendance
        });

    } catch (error) {
        console.error("Check-out error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// GET MY ATTENDANCE

const getMyAttendance = async (req, res) => {
    try {
        const employeeId = req.user.userId;

        const attendance = await Attendance.find({
            employee: employeeId
        }).sort({ date: -1 });

        res.status(200).json({
            message: "Attendance fetched successfully",
            attendance
        });

    } catch (error) {
        console.error("Get attendance error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getMyAttendance
};
