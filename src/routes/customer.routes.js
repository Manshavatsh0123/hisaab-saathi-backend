const express = require("express");

const {
    createCustomer,
} = require("../controllers/customer.controller");

const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    createCustomer
);

module.exports = router;