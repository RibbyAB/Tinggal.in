const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const authService = require("../services/authService");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.login(email, password);
  success(res, { message: "Login successful.", data: { token, user } });
});

const logout = asyncHandler(async (req, res) => {
  success(res, { message: "Logout successful." });
});

const getMe = asyncHandler(async (req, res) => {
  success(res, { message: "Current user fetched.", data: req.user });
});

module.exports = { login, logout, getMe };
