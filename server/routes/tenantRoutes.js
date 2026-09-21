const express = require("express");
const router = express.Router();

const { getTenants, getTenant, createTenant, updateTenant } = require("../controllers/tenantController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { attachTenantId } = require("../middleware/tenantOwnershipMiddleware");
const { validate } = require("../validators/validate");
const { createTenantValidator, updateTenantValidator } = require("../validators/tenantValidator");

router.use(authenticateToken, attachTenantId);

router.get("/", authorizeRoles("OWNER", "ADMIN"), getTenants);
router.get("/:id", getTenant);
router.post("/", authorizeRoles("OWNER", "ADMIN"), validate(createTenantValidator), createTenant);
router.put("/:id", validate(updateTenantValidator), updateTenant);

module.exports = router;
