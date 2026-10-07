const express = require("express");

const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { approveAdminCollection, rejectAdminCollection,reversePayment } = require("../controllers/admin.controller");

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

router.post(
    "/collections/:paymentId/approve",
    requireAuth,
    requireRole("ADMIN"),
    approveAdminCollection
);

router.post(
    "/collections/:paymentId/reject",
    requireAuth,
    requireRole("ADMIN"),
    rejectAdminCollection
);

router.post(
    "/collections/:paymentId/reverse",
    requireAuth,
    requireRole("ADMIN"),
    reversePayment
);

module.exports = router;