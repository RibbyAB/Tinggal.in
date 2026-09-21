const express = require("express");
const router = express.Router();

const { login, logout, getMe } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const { validate } = require("../validators/validate");
const { loginValidator } = require("../validators/authValidator");

router.post("/login", authLimiter, validate(loginValidator), login);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getMe);

module.exports = router;
