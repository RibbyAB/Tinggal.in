const express = require("express");
const router = express.Router();

const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaintStatus,
} = require("../controllers/complaintController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { attachTenantId } = require("../middleware/tenantOwnershipMiddleware");
const { uploadComplaintImage } = require("../middleware/uploadMiddleware");
const { validate } = require("../validators/validate");
const {
  createComplaintValidator,
  updateComplaintStatusValidator,
} = require("../validators/complaintValidator");

router.use(authenticateToken, attachTenantId);

router.get("/", getComplaints);
router.get("/:id", getComplaint);
router.post(
  "/",
  authorizeRoles("TENANT"),
  uploadComplaintImage,
  validate(createComplaintValidator),
  createComplaint
);
router.patch(
  "/:id/status",
  authorizeRoles("ADMIN", "OWNER"),
  validate(updateComplaintStatusValidator),
  updateComplaintStatus
);

module.exports = router;
