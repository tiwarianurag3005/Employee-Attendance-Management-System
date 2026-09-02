const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["EMPLOYEE", "HR"],
            default: "EMPLOYEE"
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        // Leave Balance
        leaveBalance: {
            casual: {
                type: Number,
                default: 2
            },

            sick: {
                type: Number,
                default: 1
            },

            paid: {
                type: Number,
                default: 3
            }
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
