const prisma = require("../utils/prismaClient");
const AppError = require("../utils/AppError");
const { logActivity } = require("./activityLogService");

async function listRooms({ search, status, type, floor, page = 1, limit = 10 }) {
  const where = {
    AND: [
      search ? { roomNumber: { contains: search } } : {},
      status ? { status } : {},
      type ? { type } : {},
      floor ? { floor: Number(floor) } : {},
    ],
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({ where, skip, take: Number(limit), orderBy: { roomNumber: "asc" } }),
    prisma.room.count({ where }),
  ]);

  return { rooms, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
}

async function getRoomById(id) {
  const room = await prisma.room.findUnique({
    where: { id: Number(id) },
    include: { rentals: { where: { status: "ACTIVE" }, include: { tenant: { include: { user: true } } } } },
  });
  if (!room) throw new AppError("Room not found.", 404);
  return room;
}

async function createRoom(data, actingUser) {
  const existing = await prisma.room.findUnique({ where: { roomNumber: data.roomNumber } });
  if (existing) throw new AppError("A room with this number already exists.", 409);

  return prisma.$transaction(async (tx) => {
    const room = await tx.room.create({
      data: {
        roomNumber: data.roomNumber,
        floor: Number(data.floor),
        type: data.type || "STANDARD",
        price: data.price,
        capacity: data.capacity ? Number(data.capacity) : 1,
        facilities: data.facilities || null,
        description: data.description || null,
      },
    });
    await logActivity(tx, {
      userId: actingUser.id,
      action: "ROOM_CREATED",
      entity: "Room",
      entityId: room.id,
      details: `Room ${room.roomNumber} created.`,
    });
    return room;
  });
}

async function updateRoom(id, data, actingUser) {
  const room = await prisma.room.findUnique({ where: { id: Number(id) } });
  if (!room) throw new AppError("Room not found.", 404);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.room.update({
      where: { id: Number(id) },
      data: {
        roomNumber: data.roomNumber ?? room.roomNumber,
        floor: data.floor !== undefined ? Number(data.floor) : room.floor,
        type: data.type ?? room.type,
        price: data.price ?? room.price,
        capacity: data.capacity !== undefined ? Number(data.capacity) : room.capacity,
        facilities: data.facilities ?? room.facilities,
        description: data.description ?? room.description,
      },
    });
    await logActivity(tx, {
      userId: actingUser.id,
      action: "ROOM_UPDATED",
      entity: "Room",
      entityId: updated.id,
      details: `Room ${updated.roomNumber} updated.`,
    });
    return updated;
  });
}

const MANUAL_STATUSES = ["AVAILABLE", "MAINTENANCE"];

async function updateRoomStatus(id, status, actingUser) {
  const room = await prisma.room.findUnique({ where: { id: Number(id) } });
  if (!room) throw new AppError("Room not found.", 404);

  if (!MANUAL_STATUSES.includes(status)) {
    throw new AppError(
      "Room status can only be set to AVAILABLE or MAINTENANCE. OCCUPIED is set automatically at check-in.",
      422
    );
  }

  const activeRental = await prisma.rental.findFirst({
    where: { roomId: Number(id), status: "ACTIVE" },
  });
  if (activeRental) {
    throw new AppError(
      "This room still has an active tenant. Check the tenant out before changing the room status.",
      409
    );
  }

  if (room.status === status) return room;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.room.update({ where: { id: Number(id) }, data: { status } });
    await logActivity(tx, {
      userId: actingUser.id,
      action: "ROOM_STATUS_CHANGED",
      entity: "Room",
      entityId: updated.id,
      details: `Status changed to ${status}.`,
    });
    return updated;
  });
}

module.exports = { listRooms, getRoomById, createRoom, updateRoom, updateRoomStatus };