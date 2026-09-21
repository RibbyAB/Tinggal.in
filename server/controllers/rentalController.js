const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const rentalService = require("../services/rentalService");

const getRentals = asyncHandler(async (req, res) => {
  // A TENANT only ever sees their own rentals.
  const query = req.user.role === "TENANT" ? { ...req.query, tenantId: req.tenantId } : req.query;
  const result = await rentalService.listRentals(query);
  success(res, { message: "Rentals fetched.", data: result });
});

const createRental = asyncHandler(async (req, res) => {
  const rental = await rentalService.createRental(req.body, req.user);
  success(res, { message: "Tenant checked in successfully.", data: rental, statusCode: 201 });
});

const checkoutRental = asyncHandler(async (req, res) => {
  const rental = await rentalService.checkoutRental(req.params.id, req.user);
  success(res, { message: "Tenant checked out successfully.", data: rental });
});

module.exports = { getRentals, createRental, checkoutRental };
