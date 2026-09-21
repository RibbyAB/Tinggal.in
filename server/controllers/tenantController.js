const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");
const tenantService = require("../services/tenantService");

const getTenants = asyncHandler(async (req, res) => {
  const result = await tenantService.listTenants(req.query);
  success(res, { message: "Tenants fetched.", data: result });
});

// Rule: tenant cannot access another tenant's data. A TENANT calling this
// may only fetch their own profile.
const getTenant = asyncHandler(async (req, res) => {
  if (req.user.role === "TENANT" && req.user.tenant?.id !== Number(req.params.id)) {
    return error(res, { message: "You can only view your own profile.", statusCode: 403 });
  }
  const tenant = await tenantService.getTenantById(req.params.id);
  success(res, { message: "Tenant fetched.", data: tenant });
});

const createTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body, req.user);
  success(res, { message: "Tenant created successfully.", data: tenant, statusCode: 201 });
});

const updateTenant = asyncHandler(async (req, res) => {
  if (req.user.role === "TENANT" && req.user.tenant?.id !== Number(req.params.id)) {
    return error(res, { message: "You can only update your own profile.", statusCode: 403 });
  }
  const tenant = await tenantService.updateTenant(req.params.id, req.body, req.user);
  success(res, { message: "Tenant updated successfully.", data: tenant });
});

module.exports = { getTenants, getTenant, createTenant, updateTenant };
