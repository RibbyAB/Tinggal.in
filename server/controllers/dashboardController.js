const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const dashboardService = require("../services/dashboardService");

const getOwnerDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOwnerDashboard();
  success(res, { message: "Owner dashboard fetched.", data });
});

const getAdminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  success(res, { message: "Admin dashboard fetched.", data });
});

const getTenantDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTenantDashboard(req.tenantId);
  success(res, { message: "Tenant dashboard fetched.", data });
});

module.exports = { getOwnerDashboard, getAdminDashboard, getTenantDashboard };
