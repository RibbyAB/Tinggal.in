const express = require("express");
const router = express.Router();

const { getActivityLogs } = require("../controllers/activityLogController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, authorizeRoles("OWNER", "ADMIN"), getActivityLogs);

module.exports = router;
