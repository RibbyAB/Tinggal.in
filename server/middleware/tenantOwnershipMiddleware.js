const prisma = require("../utils/prismaClient");
const { error } = require("../utils/apiResponse");

async function attachTenantId(req, res, next) {
  if (req.user.role !== "TENANT") return next();

  if (!req.user.tenant) {
    return error(res, { message: "No tenant profile linked to this account.", statusCode: 403 });
  }

  req.tenantId = req.user.tenant.id;
  next();
}

module.exports = { attachTenantId };
