const prisma = require("../utils/prismaClient");
const AppError = require("../utils/AppError");
const { logActivity } = require("./activityLogService");

async function listBills({ status, month, tenantId, page = 1, limit = 10 }) {
  const where = {
    AND: [
      status ? { status } : {},
      month ? { billMonth: Number(month) } : {},
      tenantId ? { rental: { tenantId: Number(tenantId) } } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [bills, total] = await Promise.all([
    prisma.bill.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        rental: { include: { tenant: { include: { user: true } }, room: true } },
        payments: true,
      },
      orderBy: [{ billYear: "desc" }, { billMonth: "desc" }],
    }),
    prisma.bill.count({ where }),
  ]);

  return { bills, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
}

async function getBillById(id) {
  const bill = await prisma.bill.findUnique({
    where: { id: Number(id) },
    include: {
      rental: { include: { tenant: { include: { user: true } }, room: true } },
      payments: true,
    },
  });
  if (!bill) throw new AppError("Bill not found.", 404);
  return bill;
}

async function generateBill(data, actingUser) {
  const rentalId = Number(data.rentalId);
  const billMonth = Number(data.billMonth);
  const billYear = Number(data.billYear);

  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) throw new AppError("Rental not found.", 404);
  if (rental.status !== "ACTIVE") {
    throw new AppError("Cannot generate a bill for a rental that is not active.", 409);
  }

  const existing = await prisma.bill.findUnique({
    where: { uniqueBillPerMonth: { rentalId, billMonth, billYear } },
  });
  if (existing) throw new AppError("A bill for this rental and month already exists.", 409);

  return prisma.$transaction(async (tx) => {
    const bill = await tx.bill.create({
      data: {
        rentalId,
        billMonth,
        billYear,
        amount: rental.monthlyPrice,
        dueDate: new Date(data.dueDate),
        status: "UNPAID",
      },
    });

    await logActivity(tx, {
      userId: actingUser.id,
      action: "BILL_GENERATED",
      entity: "Bill",
      entityId: bill.id,
      details: `Bill for ${billMonth}/${billYear} generated for rental #${rentalId}.`,
    });

    return bill;
  });
}

module.exports = { listBills, getBillById, generateBill };
