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

// Only the tenant who owns the bill may upload a payment proof for it.
// tenantId is derived from the authenticated session (never trusted from
// the request body) to prevent IDOR.
async function createPayment(data, proofFilePath, tenantId) {
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
      userId: null,
      action: "PAYMENT_SUBMITTED",
      entity: "Payment",
      entityId: payment.id,
      details: `Payment submitted for bill #${bill.id}.`,
    });

    return payment;
  });
}

// Approval flow (see spec section 11):
// Validate payment -> Update payment -> Update bill -> Save verifier -> Log activity
async function approvePayment(paymentId, actingUser) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: Number(paymentId) }, include: { bill: true } });
    if (!payment) throw new AppError("Payment not found.", 404);

    // Business rule: payment cannot be approved twice.
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

async function rejectPayment(paymentId, note, actingUser) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: Number(paymentId) } });
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

    // Bill goes back to UNPAID so the tenant can resubmit.
    await tx.bill.update({ where: { id: payment.billId }, data: { status: "UNPAID" } });

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
