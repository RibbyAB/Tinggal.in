const prisma = require("../utils/prismaClient");
const AppError = require("../utils/AppError");
const { logActivity } = require("./activityLogService");

async function listComplaints({ status, priority, category, tenantId, page = 1, limit = 10 }) {
  const where = {
    AND: [
      status ? { status } : {},
      priority ? { priority } : {},
      category ? { category } : {},
      tenantId ? { tenantId: Number(tenantId) } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take: Number(limit),
      include: { tenant: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.complaint.count({ where }),
  ]);

  return { complaints, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
}

// tenantId comes from the URL param for OWNER/ADMIN, but derived from the
// session for TENANT (enforced in the controller) so a tenant cannot read
// another tenant's complaint by id (IDOR).
async function getComplaintById(id, { tenantId = null } = {}) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: Number(id) },
    include: {
      tenant: { include: { user: true } },
      updates: { include: { updatedBy: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!complaint) throw new AppError("Complaint not found.", 404);
  if (tenantId !== null && complaint.tenantId !== tenantId) {
    throw new AppError("You do not have permission to view this complaint.", 403);
  }
  return complaint;
}

async function createComplaint(data, imagePath, tenantId) {
  return prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        category: data.category || "OTHER",
        priority: data.priority || "MEDIUM",
        imagePath,
        status: "OPEN",
      },
    });

    await logActivity(tx, {
      userId: null,
      action: "COMPLAINT_SUBMITTED",
      entity: "Complaint",
      entityId: complaint.id,
      details: `Complaint "${complaint.title}" submitted.`,
    });

    return complaint;
  });
}

// Complaint flow: OPEN -> IN_PROGRESS -> RESOLVED (-> CLOSED). Every change
// is recorded as a ComplaintUpdate row so the handling history is visible.
async function updateComplaintStatus(id, status, note, actingUser) {
  return prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findUnique({ where: { id: Number(id) } });
    if (!complaint) throw new AppError("Complaint not found.", 404);

    const updatedComplaint = await tx.complaint.update({ where: { id: Number(id) }, data: { status } });

    await tx.complaintUpdate.create({
      data: { complaintId: complaint.id, updatedById: actingUser.id, status, note: note || null },
    });

    await logActivity(tx, {
      userId: actingUser.id,
      action: "COMPLAINT_STATUS_CHANGED",
      entity: "Complaint",
      entityId: complaint.id,
      details: `Status changed to ${status}.`,
    });

    return updatedComplaint;
  });
}

module.exports = { listComplaints, getComplaintById, createComplaint, updateComplaintStatus };
