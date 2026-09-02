const hrOnly = (req, res, next) => {
    if (req.user.role !== "HR") {
        return res.status(403).json({
            message: "Access denied. HR only."
        });
    }

    next();
};

module.exports = hrOnly;