const express = require("express");

const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get(
    "/test",
    requireAuth,
    requireRole("ADMIN"),
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Admin route protected successfully",
            user: {
                id: req.user.id,
                email: req.user.email,
            },
            profile: {
                role: req.profile.role,
                username: req.profile.username,
                full_name: req.profile.full_name,
            },
        });
    }
);

module.exports = router;