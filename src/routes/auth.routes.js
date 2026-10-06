const express = require("express");

const { login, staffLogin } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", login);

router.post(
    "/staff/login",
    staffLogin
);

module.exports = router;