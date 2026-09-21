const prisma = require("../utils/prismaClient");

// Revenue trend: total APPROVED payment amount, grouped by month, for the
// last `months` months. Aggregated in JS for readability (dataset sizes in
// a student project are small, so this keeps the SQL simple and explainable).
async function getRevenueReport(months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const payments = await prisma.payment.findMany({
    where: { status: "APPROVED", verifiedAt: { gte: since } },
    select: { amount: true, verifiedAt: true },
  });

  const buckets = {};
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets[key] = 0;
  }

  for (const p of payments) {
    const d = new Date(p.verifiedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (buckets[key] !== undefined) buckets[key] += Number(p.amount);
  }

  return Object.entries(buckets).map(([month, revenue]) => ({ month, revenue }));
}

async function getOccupancyReport() {
  const [total, occupied, available, maintenance] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: "OCCUPIED" } }),
    prisma.room.count({ where: { status: "AVAILABLE" } }),
    prisma.room.count({ where: { status: "MAINTENANCE" } }),
  ]);

  const occupancyRate = total > 0 ? Number(((occupied / total) * 100).toFixed(1)) : 0;

  return { total, occupied, available, maintenance, occupancyRate };
}

async function getPaymentStatusReport() {
  const statuses = ["PENDING", "APPROVED", "REJECTED"];
  const counts = await Promise.all(
    statuses.map((status) => prisma.payment.count({ where: { status } }))
  );
  return statuses.map((status, i) => ({ status, count: counts[i] }));
}

module.exports = { getRevenueReport, getOccupancyReport, getPaymentStatusReport };
