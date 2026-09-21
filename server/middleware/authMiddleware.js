const jwt = require("jsonwebtoken");
const prisma = require("../utils/prismaClient");
const { error } = require("../utils/apiResponse");

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return error(res, { message: "Authentication token is missing.", statusCode: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      return error(res, { message: "Account not found or deactivated.", statusCode: 401 });
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return error(res, { message: "Invalid or expired token.", statusCode: 401 });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, { message: "Authentication required.", statusCode: 401 });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return error(res, {
        message: "You do not have permission to perform this action.",
        statusCode: 403,
      });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
