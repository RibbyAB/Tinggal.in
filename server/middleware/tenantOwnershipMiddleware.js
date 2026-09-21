const prisma = require("../utils/prismaClient");
const { error } = require("../utils/apiResponse");

// Attaches req.tenantId for the logged-in TENANT user, and blocks TENANT
// users who somehow have no linked Tenant profile. OWNER/ADMIN skip this
// (they are allowed to act on any tenant, subject to each route's own checks).
// This exists specifically to prevent IDOR: a tenant passing another
// tenant's billId/complaintId/paymentId in the URL.
async function attachTenantId(req, res, next) {
  if (req.user.role !== "TENANT") return next();

  if (!req.user.tenant) {
    return error(res, { message: "No tenant profile linked to this account.", statusCode: 403 });
  }

  req.tenantId = req.user.tenant.id;
  next();
}

module.exports = { attachTenantId };
