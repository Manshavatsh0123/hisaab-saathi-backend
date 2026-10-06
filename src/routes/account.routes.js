const express = require("express");

const {
    createAccount,
} = require("../controllers/account.controller");

const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.post(
    "/customers/:customerId/accounts",
    requireAuth,
    requireRole("ADMIN"),
    createAccount
);

module.exports = router;