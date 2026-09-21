const prisma = require("../utils/prismaClient");
const AppError = require("../utils/AppError");
const { logActivity } = require("./activityLogService");

async function listRentals({ status, tenantId, roomId, page = 1, limit = 10 }) {
  const where = {
    AND: [
      status ? { status } : {},
      tenantId ? { tenantId: Number(tenantId) } : {},
      roomId ? { roomId: Number(roomId) } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [rentals, total] = await Promise.all([
    prisma.rental.findMany({
      where,
      skip,
      take: Number(limit),
      include: { tenant: { include: { user: true } }, room: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rental.count({ where }),
  ]);

  return { rentals, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
}

// Check-in flow (see spec section 11):
// Validate tenant -> Validate room -> Create rental -> Update room -> Log activity
// All wrapped in a single transaction so a failure at any step rolls everything back.
async function createRental(data, actingUser) {
  const tenantId = Number(data.tenantId);
  const roomId = Number(data.roomId);

  return prisma.$transaction(async (tx) => {
    // 1. Validate tenant exists
    const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new AppError("Tenant not found.", 404);

    // Business rule: tenant cannot have multiple ACTIVE rentals simultaneously.
    const existingActiveRental = await tx.rental.findFirst({
      where: { tenantId, status: "ACTIVE" },
    });
    if (existingActiveRental) {
      throw new AppError("This tenant already has an active rental.", 409);
    }

    // 2. Validate room exists and has capacity available
    const room = await tx.room.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError("Room not found.", 404);
    if (room.status === "MAINTENANCE") {
      throw new AppError("Room is under maintenance and cannot be assigned.", 409);
    }

    const activeOccupants = await tx.rental.count({ where: { roomId, status: "ACTIVE" } });
    if (activeOccupants >= room.capacity) {
      throw new AppError("Room capacity has been reached.", 409);
    }

    // 3. Create rental - snapshot the room's current price so future price
    //    changes never alter this rental's historical price.
    const rental = await tx.rental.create({
      data: {
        tenantId,
        roomId,
        monthlyPrice: room.price,
        startDate: new Date(data.startDate),
        notes: data.notes || null,
        status: "ACTIVE",
      },
    });

    // 4. Update room status: if the room is now at capacity, mark it OCCUPIED.
    const occupantsAfter = activeOccupants + 1;
    if (occupantsAfter >= room.capacity) {
      await tx.room.update({ where: { id: roomId }, data: { status: "OCCUPIED" } });
    }

    // 5. Log activity
    await logActivity(tx, {
      userId: actingUser.id,
      action: "RENTAL_CREATED",
      entity: "Rental",
      entityId: rental.id,
      details: `Tenant #${tenantId} checked into room ${room.roomNumber}.`,
    });

    return rental;
  });
}

// Checkout flow: closes the active rental and frees up the room.
async function checkoutRental(rentalId, actingUser) {
  return prisma.$transaction(async (tx) => {
    const rental = await tx.rental.findUnique({ where: { id: Number(rentalId) }, include: { room: true } });
    if (!rental) throw new AppError("Rental not found.", 404);
    if (rental.status !== "ACTIVE") throw new AppError("Only active rentals can be checked out.", 409);

    const updatedRental = await tx.rental.update({
      where: { id: Number(rentalId) },
      data: { status: "COMPLETED", endDate: new Date() },
    });

    // Room availability updates according to active rentals remaining.
    const remainingActive = await tx.rental.count({
      where: { roomId: rental.roomId, status: "ACTIVE" },
    });
    if (remainingActive === 0 && rental.room.status !== "MAINTENANCE") {
      await tx.room.update({ where: { id: rental.roomId }, data: { status: "AVAILABLE" } });
    }

    await logActivity(tx, {
      userId: actingUser.id,
      action: "RENTAL_CHECKOUT",
      entity: "Rental",
      entityId: updatedRental.id,
      details: `Rental #${updatedRental.id} checked out.`,
    });

    return updatedRental;
  });
}

module.exports = { listRentals, createRental, checkoutRental };
