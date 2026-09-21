const express = require("express");
const router = express.Router();

const { getRentals, createRental, checkoutRental } = require("../controllers/rentalController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { attachTenantId } = require("../middleware/tenantOwnershipMiddleware");
const { validate } = require("../validators/validate");
const { createRentalValidator } = require("../validators/rentalValidator");

router.use(authenticateToken, attachTenantId);

router.get("/", getRentals);
router.post("/", authorizeRoles("OWNER", "ADMIN"), validate(createRentalValidator), createRental);
router.post("/:id/checkout", authorizeRoles("OWNER", "ADMIN"), checkoutRental);

module.exports = router;
