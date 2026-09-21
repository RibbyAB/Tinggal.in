const { PrismaClient } = require("@prisma/client");

// Single shared Prisma instance for the whole app (recommended by Prisma docs
// to avoid exhausting the MySQL connection pool in development).
const prisma = new PrismaClient();

module.exports = prisma;
