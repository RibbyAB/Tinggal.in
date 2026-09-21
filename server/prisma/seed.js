const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const DEMO_PASSWORD = "password123";

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("Seeding database...");

  await prisma.complaintUpdate.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash(DEMO_PASSWORD);

  const owner = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "owner@kostdemo.local",
      password: passwordHash,
      phone: "081234567890",
      role: "OWNER",
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      name: "Siti Rahayu",
      email: "admin@kostdemo.local",
      password: passwordHash,
      phone: "081234567891",
      role: "ADMIN",
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: "Agus Wijaya",
      email: "agus.admin@kostdemo.local",
      password: passwordHash,
      phone: "081234567892",
      role: "ADMIN",
    },
  });

  const roomTypes = ["STANDARD", "DELUXE", "VIP"];
  const roomPrices = { STANDARD: 1200000, DELUXE: 1800000, VIP: 2500000 };
  const roomsData = [];
  let roomCounter = 1;
  for (let floor = 1; floor <= 3; floor++) {
    for (let i = 1; i <= 6; i++) {
      const type = roomTypes[roomCounter % 3];
      roomsData.push({
        roomNumber: `${floor}0${i}`,
        floor,
        type,
        price: roomPrices[type],
        capacity: type === "VIP" ? 1 : 2,
        facilities:
          type === "VIP"
            ? "AC, Kamar Mandi Dalam, WiFi, TV, Lemari"
            : type === "DELUXE"
            ? "AC, Kamar Mandi Dalam, WiFi, Lemari"
            : "Kipas Angin, WiFi, Lemari",
        description: `Kamar ${type.toLowerCase()} di lantai ${floor}`,
        status: "AVAILABLE",
      });
      roomCounter++;
    }
  }

  await prisma.room.createMany({ data: roomsData });
  const rooms = await prisma.room.findMany({ orderBy: { roomNumber: "asc" } });

  const tenantNames = [
    "Andi Pratama",
    "Dewi Lestari",
    "Rizky Ramadhan",
    "Putri Ayu",
    "Fajar Nugroho",
    "Indah Permata",
    "Yusuf Firmansyah",
    "Nadia Kusuma",
    "Bayu Setiawan",
    "Maya Anggraini",
    "Dimas Saputra",
    "Rani Oktaviani",
  ];

  const tenants = [];
  for (let i = 0; i < tenantNames.length; i++) {
    const name = tenantNames[i];
    const emailSlug = name.toLowerCase().replace(/\s+/g, ".");
    const user = await prisma.user.create({
      data: {
        name,
        email: `${emailSlug}@kostdemo.local`,
        password: passwordHash,
        phone: `0813${String(1000000 + i).slice(0, 8)}`,
        role: "TENANT",
      },
    });
    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        ktpNumber: `35710${String(1000000 + i).padStart(10, "0")}`,
        emergencyContact: `0812${String(9000000 + i).slice(0, 8)}`,
        address: "Jl. Contoh Alamat No. " + (i + 1) + ", Bandar Lampung",
      },
    });
    tenants.push(tenant);
  }

  const demoTenantUser = await prisma.user.create({
    data: {
      name: "Tenant Demo",
      email: "tenant@kostdemo.local",
      password: passwordHash,
      phone: "081200000000",
      role: "TENANT",
    },
  });
  const demoTenant = await prisma.tenant.create({
    data: {
      userId: demoTenantUser.id,
      ktpNumber: "3571000000000001",
      emergencyContact: "081200000001",
      address: "Jl. Demo Tenant No. 1, Bandar Lampung",
    },
  });
  tenants.unshift(demoTenant);

  const now = new Date();
  const activeRentals = [];

  const demoRoom = rooms[0];
  const demoRental = await prisma.rental.create({
    data: {
      tenantId: demoTenant.id,
      roomId: demoRoom.id,
      monthlyPrice: demoRoom.price,
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      status: "ACTIVE",
    },
  });
  await prisma.room.update({ where: { id: demoRoom.id }, data: { status: "OCCUPIED" } });
  activeRentals.push(demoRental);

  for (let i = 0; i < 8; i++) {
    const tenant = tenants[i + 1];
    const room = rooms[i + 1];
    const rental = await prisma.rental.create({
      data: {
        tenantId: tenant.id,
        roomId: room.id,
        monthlyPrice: room.price,
        startDate: new Date(now.getFullYear(), now.getMonth() - (i % 4), 1),
        status: "ACTIVE",
      },
    });
    await prisma.room.update({ where: { id: room.id }, data: { status: "OCCUPIED" } });
    activeRentals.push(rental);
  }

  for (let i = 9; i < 12; i++) {
    const tenant = tenants[i];
    const room = rooms[i + 1];
    await prisma.rental.create({
      data: {
        tenantId: tenant.id,
        roomId: room.id,
        monthlyPrice: room.price,
        startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        status: "COMPLETED",
      },
    });
  }

  await prisma.room.update({ where: { id: rooms[rooms.length - 1].id }, data: { status: "MAINTENANCE" } });

  for (const rental of activeRentals) {
    for (let m = 2; m >= 0; m--) {
      const billDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const dueDate = new Date(now.getFullYear(), now.getMonth() - m, 10);

      const bill = await prisma.bill.create({
        data: {
          rentalId: rental.id,
          billMonth: billDate.getMonth() + 1,
          billYear: billDate.getFullYear(),
          amount: rental.monthlyPrice,
          dueDate,
          status: "UNPAID",
        },
      });

      if (m === 2) {
        await prisma.payment.create({
          data: {
            billId: bill.id,
            amount: bill.amount,
            method: "BANK_TRANSFER",
            proofFilePath: "/uploads/payments/sample-proof.png",
            status: "APPROVED",
            verifiedById: owner.id,
            verifiedAt: dueDate,
          },
        });
        await prisma.bill.update({ where: { id: bill.id }, data: { status: "PAID" } });
      } else if (m === 1) {
        await prisma.payment.create({
          data: {
            billId: bill.id,
            amount: bill.amount,
            method: "E_WALLET",
            proofFilePath: "/uploads/payments/sample-proof.png",
            status: "PENDING",
          },
        });
        await prisma.bill.update({ where: { id: bill.id }, data: { status: "PENDING_VERIFICATION" } });
      }
    }
  }

  const complaintSeeds = [
    { title: "AC tidak dingin", category: "FACILITY", priority: "MEDIUM", status: "OPEN" },
    { title: "Lampu kamar mati", category: "ELECTRICITY", priority: "HIGH", status: "IN_PROGRESS" },
    { title: "Air kamar mandi kecil", category: "WATER", priority: "MEDIUM", status: "RESOLVED" },
    { title: "Area parkir kurang bersih", category: "CLEANLINESS", priority: "LOW", status: "OPEN" },
    { title: "Pintu gerbang rusak", category: "SECURITY", priority: "HIGH", status: "CLOSED" },
  ];

  for (let i = 0; i < complaintSeeds.length; i++) {
    const seed = complaintSeeds[i];
    const tenant = activeRentals[i % activeRentals.length];
    const complaint = await prisma.complaint.create({
      data: {
        tenantId: tenant.tenantId,
        title: seed.title,
        description: `${seed.title} - mohon segera ditindaklanjuti.`,
        category: seed.category,
        priority: seed.priority,
        status: seed.status,
      },
    });

    if (seed.status !== "OPEN") {
      await prisma.complaintUpdate.create({
        data: {
          complaintId: complaint.id,
          updatedById: admin1.id,
          status: seed.status,
          note: "Sedang/telah ditangani oleh admin.",
        },
      });
    }
  }

  await prisma.activityLog.createMany({
    data: [
      { userId: owner.id, action: "SYSTEM_SEEDED", entity: "System", details: "Database seeded with demo data." },
      { userId: owner.id, action: "PAYMENT_APPROVED", entity: "Payment", details: "Demo seed activity." },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo accounts (password for all: " + DEMO_PASSWORD + "):");
  console.log("  Owner:  owner@kostdemo.local");
  console.log("  Admin:  admin@kostdemo.local");
  console.log("  Tenant: tenant@kostdemo.local");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
