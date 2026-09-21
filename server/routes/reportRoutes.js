const express = require("express");
const router = express.Router();

const {
  getRevenueReport,
  getOccupancyReport,
  getPaymentStatusReport,
} = require("../controllers/reportController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.use(authenticateToken, authorizeRoles("OWNER"));

router.get("/revenue", getRevenueReport);
router.get("/occupancy", getOccupancyReport);
router.get("/payments", getPaymentStatusReport);

module.exports = router;
