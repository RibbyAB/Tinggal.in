const { isEmpty, isPositiveNumber } = require("./validate");

const PAYMENT_METHODS = ["BANK_TRANSFER", "CASH", "E_WALLET"];

function createPaymentValidator(body) {
  const errors = [];
  if (isEmpty(body.billId)) errors.push({ field: "billId", message: "Bill is required." });
  if (isEmpty(body.amount) || !isPositiveNumber(body.amount)) {
    errors.push({ field: "amount", message: "Amount must be a positive number." });
  }
  if (body.method && !PAYMENT_METHODS.includes(body.method)) {
    errors.push({ field: "method", message: `Method must be one of: ${PAYMENT_METHODS.join(", ")}` });
  }
  return errors;
}

module.exports = { createPaymentValidator };
