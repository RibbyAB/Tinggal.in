const express = require("express");
const router = express.Router();

const {
  getPayments,
  createPayment,
  approvePayment,
  rejectPayment,
} = require("../controllers/paymentController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { attachTenantId } = require("../middleware/tenantOwnershipMiddleware");
const { uploadPaymentProof } = require("../middleware/uploadMiddleware");
const { validate } = require("../validators/validate");
const { createPaymentValidator } = require("../validators/paymentValidator");

router.use(authenticateToken, attachTenantId);

router.get("/", getPayments);
router.post(
  "/",
  authorizeRoles("TENANT"),
  uploadPaymentProof,
  validate(createPaymentValidator),
  createPayment
);
router.patch("/:id/approve", authorizeRoles("OWNER"), approvePayment);
router.patch("/:id/reject", authorizeRoles("OWNER"), rejectPayment);

module.exports = router;
