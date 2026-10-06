const express = require("express");

const {
    createStaff,
} = require("../controllers/staff.controller");

const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    createStaff
);

module.exports = router;