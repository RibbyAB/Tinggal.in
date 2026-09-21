const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/apiResponse");
const billService = require("../services/billService");

const getBills = asyncHandler(async (req, res) => {
  const query = req.user.role === "TENANT" ? { ...req.query, tenantId: req.tenantId } : req.query;
  const result = await billService.listBills(query);
  success(res, { message: "Bills fetched.", data: result });
});

const getBill = asyncHandler(async (req, res) => {
  const bill = await billService.getBillById(req.params.id);
  if (req.user.role === "TENANT" && bill.rental.tenantId !== req.tenantId) {
    return error(res, { message: "You can only view your own bills.", statusCode: 403 });
  }
  success(res, { message: "Bill fetched.", data: bill });
});

const generateBill = asyncHandler(async (req, res) => {
  const bill = await billService.generateBill(req.body, req.user);
  success(res, { message: "Bill generated successfully.", data: bill, statusCode: 201 });
});

module.exports = { getBills, getBill, generateBill };
