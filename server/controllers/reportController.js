const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const reportService = require("../services/reportService");

const getRevenueReport = asyncHandler(async (req, res) => {
  const data = await reportService.getRevenueReport(req.query.months ? Number(req.query.months) : 6);
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
