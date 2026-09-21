const express = require("express");
const router = express.Router();

const { getBills, getBill, generateBill } = require("../controllers/billController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { attachTenantId } = require("../middleware/tenantOwnershipMiddleware");
const { validate } = require("../validators/validate");
const { generateBillValidator } = require("../validators/billValidator");

router.use(authenticateToken, attachTenantId);

router.get("/", getBills); // TENANT scoped to own bills inside controller
router.get("/:id", getBill);
router.post("/generate", authorizeRoles("OWNER", "ADMIN"), validate(generateBillValidator), generateBill);

module.exports = router;
