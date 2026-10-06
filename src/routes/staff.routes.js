const express = require("express");

const {
    createStaff,
    getStaffCustomers,
    getStaffCustomerDetails,
    submitStaffCollection,
} = require("../controllers/staff.controller");

const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get(
    "/customers",
    requireAuth,
    requireRole("STAFF"),
    getStaffCustomers
);

router.get(
    "/customers/:customerId",
    requireAuth,
    requireRole("STAFF"),
    getStaffCustomerDetails
);

router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    createStaff
);

router.post(
    "/collections",
    requireAuth,
    requireRole("STAFF"),
    submitStaffCollection
);

module.exports = router;