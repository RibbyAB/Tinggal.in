const express = require("express");
const router = express.Router();

const {
  getOwnerDashboard,
  getAdminDashboard,
  getTenantDashboard,
} = require("../controllers/dashboardController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { attachTenantId } = require("../middleware/tenantOwnershipMiddleware");

router.use(authenticateToken, attachTenantId);

router.get("/owner", authorizeRoles("OWNER"), getOwnerDashboard);
router.get("/admin", authorizeRoles("ADMIN"), getAdminDashboard);
router.get("/tenant", authorizeRoles("TENANT"), getTenantDashboard);

module.exports = router;
