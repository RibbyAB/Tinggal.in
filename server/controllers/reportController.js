const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const reportService = require("../services/reportService");

const getRevenueReport = asyncHandler(async (req, res) => {
  const requested = Number(req.query.months);
  const months = Number.isFinite(requested) ? Math.min(Math.max(Math.trunc(requested), 1), 24) : 6;
  const data = await reportService.getRevenueReport(months);
  success(res, { message: "Revenue report fetched.", data });
});

const getOccupancyReport = asyncHandler(async (req, res) => {
  const data = await reportService.getOccupancyReport();
  success(res, { message: "Occupancy report fetched.", data });
});

const getPaymentStatusReport = asyncHandler(async (req, res) => {
  const data = await reportService.getPaymentStatusReport();
  success(res, { message: "Payment status report fetched.", data });
});

module.exports = { getRevenueReport, getOccupancyReport, getPaymentStatusReport };
