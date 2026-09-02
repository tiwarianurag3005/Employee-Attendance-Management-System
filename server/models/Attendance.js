const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: String,
            required: true
        },

        checkIn: {
            type: Date,
            default: null
        },

        checkOut: {
            type: Date,
            default: null
        },

        workingHours: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"],
            default: "ABSENT"
        }
    },
    {
        timestamps: true
    }
);

attendanceSchema.index(
    { employee: 1, date: 1 },
    { unique: true }
);

const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);

module.exports = Attendance;