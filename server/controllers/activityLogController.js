const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const prisma = require("../utils/prismaClient");

const getActivityLogs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.activityLog.count(),
  ]);

  success(res, {
    message: "Activity logs fetched.",
    data: { logs, total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

module.exports = { getActivityLogs };
