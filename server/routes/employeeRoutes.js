const express = require("express");

const {
    getEmployeeDashboard
} = require("../controllers/employeeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Employee Dashboard
router.get(
    "/dashboard",
    protect,
    getEmployeeDashboard
);


module.exports = router;