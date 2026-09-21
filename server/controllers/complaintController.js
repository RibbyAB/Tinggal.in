const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const complaintService = require("../services/complaintService");

const getComplaints = asyncHandler(async (req, res) => {
  const query = req.user.role === "TENANT" ? { ...req.query, tenantId: req.tenantId } : req.query;
  const result = await complaintService.listComplaints(query);
  success(res, { message: "Complaints fetched.", data: result });
});

const getComplaint = asyncHandler(async (req, res) => {
  const tenantId = req.user.role === "TENANT" ? req.tenantId : null;
  const complaint = await complaintService.getComplaintById(req.params.id, { tenantId });
  success(res, { message: "Complaint fetched.", data: complaint });
});

const createComplaint = asyncHandler(async (req, res) => {
  const imagePath = req.file ? `/uploads/complaints/${req.file.filename}` : null;
  const complaint = await complaintService.createComplaint(req.body, imagePath, req.tenantId);
  success(res, { message: "Complaint submitted successfully.", data: complaint, statusCode: 201 });
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const complaint = await complaintService.updateComplaintStatus(
    req.params.id,
    req.body.status,
    req.body.note,
    req.user
  );
  success(res, { message: "Complaint status updated.", data: complaint });
});

module.exports = { getComplaints, getComplaint, createComplaint, updateComplaintStatus };
