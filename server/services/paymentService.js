const prisma = require("../utils/prismaClient");
const AppError = require("../utils/AppError");
const { logActivity } = require("./activityLogService");

async function listPayments({ status, month, tenantId, page = 1, limit = 10 }) {
  const where = {
    AND: [
      status ? { status } : {},
      month ? { bill: { billMonth: Number(month) } } : {},
      tenantId ? { bill: { rental: { tenantId: Number(tenantId) } } } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        bill: { include: { rental: { include: { tenant: { include: { user: true } }, room: true } } } },
        verifiedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
}

async function createPayment(data, proofFilePath, tenantId, actingUserId) {
  const bill = await prisma.bill.findUnique({
    where: { id: Number(data.billId) },
    include: { rental: true },
  });
  if (!bill) throw new AppError("Bill not found.", 404);

  if (bill.rental.tenantId !== tenantId) {
    throw new AppError("You can only pay your own bills.", 403);
  }
  if (bill.status === "PAID") {
    throw new AppError("This bill has already been paid.", 409);
  }

  return prisma.$transaction(async (tx) => {
    const alreadyWaiting = await tx.payment.count({
      where: { billId: bill.id, status: "PENDING" },
    });
    if (alreadyWaiting > 0) {
      throw new AppError("A payment for this bill is already waiting for verification.", 409);
    }

    const payment = await tx.payment.create({
      data: {
        billId: bill.id,
        amount: data.amount,
        method: data.method || "BANK_TRANSFER",
        proofFilePath,
        status: "PENDING",
      },
    });

    await tx.bill.update({ where: { id: bill.id }, data: { status: "PENDING_VERIFICATION" } });

    await logActivity(tx, {
      userId: actingUserId,
      action: "PAYMENT_SUBMITTED",
      entity: "Payment",
      entityId: payment.id,
      details: `Payment submitted for bill #${bill.id}.`,
    });

    return payment;
  });
}

async function approvePayment(paymentId, actingUser) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: Number(paymentId) }, include: { bill: true } });
    if (!payment) throw new AppError("Payment not found.", 404);

    if (payment.status !== "PENDING") {
      throw new AppError(`Payment has already been ${payment.status.toLowerCase()}.`, 409);
    }

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status: "APPROVED", verifiedById: actingUser.id, verifiedAt: new Date() },
    });

    await tx.bill.update({ where: { id: payment.billId }, data: { status: "PAID" } });

    await logActivity(tx, {
      userId: actingUser.id,
      action: "PAYMENT_APPROVED",
      entity: "Payment",
      entityId: updatedPayment.id,
      details: `Payment #${updatedPayment.id} approved; bill #${payment.billId} marked PAID.`,
    });

    return updatedPayment;
  });
}

async function resolveBillStatus(tx, rejectedPayment) {
  const approved = await tx.payment.count({
    where: { billId: rejectedPayment.billId, status: "APPROVED" },
  });
  if (approved > 0) return "PAID";

  const stillWaiting = await tx.payment.count({
    where: { billId: rejectedPayment.billId, status: "PENDING", id: { not: rejectedPayment.id } },
  });
  if (stillWaiting > 0) return "PENDING_VERIFICATION";

  return new Date(rejectedPayment.bill.dueDate) < new Date() ? "OVERDUE" : "UNPAID";
}

async function rejectPayment(paymentId, note, actingUser) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: Number(paymentId) },
      include: { bill: true },
    });
    if (!payment) throw new AppError("Payment not found.", 404);

    if (payment.status !== "PENDING") {
      throw new AppError(`Payment has already been ${payment.status.toLowerCase()}.`, 409);
    }

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "REJECTED",
        verifiedById: actingUser.id,
        verifiedAt: new Date(),
        rejectionNote: note || null,
      },
    });

    await tx.bill.update({
      where: { id: payment.billId },
      data: { status: await resolveBillStatus(tx, payment) },
    });

    await logActivity(tx, {
      userId: actingUser.id,
      action: "PAYMENT_REJECTED",
      entity: "Payment",
      entityId: updatedPayment.id,
      details: note ? `Rejected: ${note}` : "Rejected.",
    });

    return updatedPayment;
  });
}

module.exports = { listPayments, createPayment, approvePayment, rejectPayment };
