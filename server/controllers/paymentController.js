const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const paymentService = require("../services/paymentService");
const AppError = require("../utils/AppError");

const getPayments = asyncHandler(async (req, res) => {
  const query = req.user.role === "TENANT" ? { ...req.query, tenantId: req.tenantId } : req.query;
  const result = await paymentService.listPayments(query);
  success(res, { message: "Payments fetched.", data: result });
});

const createPayment = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Payment proof file is required.", 422);
  }
  const proofFilePath = `/uploads/payments/${req.file.filename}`;
  const payment = await paymentService.createPayment(req.body, proofFilePath, req.tenantId, req.user.id);
  success(res, { message: "Payment proof submitted for verification.", data: payment, statusCode: 201 });
});

const approvePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.approvePayment(req.params.id, req.user);
  success(res, { message: "Payment approved successfully.", data: payment });
});

const rejectPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.rejectPayment(req.params.id, req.body.note, req.user);
  success(res, { message: "Payment rejected.", data: payment });
});

module.exports = { getPayments, createPayment, approvePayment, rejectPayment };
