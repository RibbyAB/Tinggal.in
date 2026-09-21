const prisma = require("../utils/prismaClient");
const AppError = require("../utils/AppError");
const { hashPassword } = require("./authService");
const { logActivity } = require("./activityLogService");

async function listTenants({ search, rentalStatus, page = 1, limit = 10 }) {
  const where = {
    AND: [
      search
        ? {
            OR: [
              { user: { name: { contains: search } } },
              { user: { email: { contains: search } } },
              { user: { phone: { contains: search } } },
            ],
          }
        : {},
      rentalStatus ? { rentals: { some: { status: rentalStatus } } } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
        rentals: { where: { status: "ACTIVE" }, include: { room: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.count({ where }),
  ]);

  return { tenants, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
}

async function getTenantById(id) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
      rentals: { include: { room: true, bills: true }, orderBy: { createdAt: "desc" } },
      complaints: true,
    },
  });
  if (!tenant) throw new AppError("Tenant not found.", 404);
  return tenant;
}

async function createTenant(data, actingUser) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new AppError("A user with this email already exists.", 409);

  const hashed = await hashPassword(data.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        phone: data.phone || null,
        role: "TENANT",
      },
    });

    const tenant = await tx.tenant.create({
      data: {
        userId: user.id,
        ktpNumber: data.ktpNumber || null,
        emergencyContact: data.emergencyContact || null,
        address: data.address || null,
      },
    });

    await logActivity(tx, {
      userId: actingUser.id,
      action: "TENANT_CREATED",
      entity: "Tenant",
      entityId: tenant.id,
      details: `Tenant ${user.name} (${user.email}) created.`,
    });

    return { ...tenant, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } };
  });
}

async function updateTenant(id, data, actingUser) {
  const tenant = await prisma.tenant.findUnique({ where: { id: Number(id) }, include: { user: true } });
  if (!tenant) throw new AppError("Tenant not found.", 404);

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tenant.userId },
      data: {
        name: data.name ?? tenant.user.name,
        email: data.email ?? tenant.user.email,
        phone: data.phone ?? tenant.user.phone,
      },
    });

    const updatedTenant = await tx.tenant.update({
      where: { id: Number(id) },
      data: {
        ktpNumber: data.ktpNumber ?? tenant.ktpNumber,
        emergencyContact: data.emergencyContact ?? tenant.emergencyContact,
        address: data.address ?? tenant.address,
      },
    });

    await logActivity(tx, {
      userId: actingUser.id,
      action: "TENANT_UPDATED",
      entity: "Tenant",
      entityId: updatedTenant.id,
    });

    return updatedTenant;
  });
}

module.exports = { listTenants, getTenantById, createTenant, updateTenant };
