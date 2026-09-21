const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prismaClient");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken(user);
  const { password: _omit, ...safeUser } = user;

  return { token, user: safeUser };
}

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

module.exports = { login, generateToken, hashPassword };
