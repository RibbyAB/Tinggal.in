const prisma = require("../utils/prismaClient");
const { getOccupancyReport } = require("./reportService");

async function getOwnerDashboard() {
  const occupancy = await getOccupancyReport();

  const [totalTenants, outstandingBills, activeComplaints, monthlyRevenueAgg] = await Promise.all([
    prisma.tenant.count(),
    prisma.bill.count({ where: { status: { in: ["UNPAID", "OVERDUE", "PENDING_VERIFICATION"] } } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "APPROVED",
        verifiedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    ...occupancy,
    totalTenants,
    monthlyRevenue: Number(monthlyRevenueAgg._sum.amount || 0),
    outstandingBills,
    activeComplaints,
  };
}

async function getAdminDashboard() {
  const [totalTenants, availableRooms, pendingPayments, activeComplaints, recentActivity] = await Promise.all([
    prisma.tenant.count(),
    prisma.room.count({ where: { status: "AVAILABLE" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, role: true } } },
    }),
  ]);

  return { totalTenants, availableRooms, pendingPayments, activeComplaints, recentActivity };
}

async function getTenantDashboard(tenantId) {
  const activeRental = await prisma.rental.findFirst({
    where: { tenantId, status: "ACTIVE" },
    include: { room: true },
  });

  let currentBill = null;
  if (activeRental) {
    currentBill = await prisma.bill.findFirst({
      where: { rentalId: activeRental.id },
      orderBy: [{ billYear: "desc" }, { billMonth: "desc" }],
    });
  }

  const [recentPayments, complaints] = await Promise.all([
    prisma.payment.findMany({
      where: { bill: { rental: { tenantId } } },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.complaint.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return { rental: activeRental, currentBill, recentPayments, complaints };
}

module.exports = { getOwnerDashboard, getAdminDashboard, getTenantDashboard };
