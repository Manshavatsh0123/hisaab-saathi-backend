const express = require("express");

const {
    addAdminCollection,
    getPaymentHistory,
    getAdminCollections,
    getAdminCollectionDetails,
} = require("../controllers/payment.controller");

const requireAuth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();


// ========================================
// ADMIN - COLLECTIONS LIST
// ========================================

router.get(
    "/admin/collections",
    requireAuth,
    requireRole("ADMIN"),
    getAdminCollections
);

// ========================================
// ADMIN - COLLECTION DETAILS
// ========================================

router.get(
    "/admin/collections/:paymentId",
    requireAuth,
    requireRole("ADMIN"),
    getAdminCollectionDetails
);


// ========================================
// ADMIN - ADD COLLECTION
// ========================================

router.post(
    "/customers/:customerId/accounts/:accountId/payments",
    requireAuth,
    requireRole("ADMIN"),
    addAdminCollection
);


// ========================================
// ADMIN - PAYMENT HISTORY
// ========================================

router.get(
    "/customers/:customerId/accounts/:accountId/payments",
    requireAuth,
    requireRole("ADMIN"),
    getPaymentHistory
);


module.exports = router;