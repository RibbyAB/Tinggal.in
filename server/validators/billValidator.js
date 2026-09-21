const { isEmpty, isValidDate } = require("./validate");

function generateBillValidator(body) {
  const errors = [];
  if (isEmpty(body.rentalId)) errors.push({ field: "rentalId", message: "Rental is required." });
  if (isEmpty(body.billMonth)) errors.push({ field: "billMonth", message: "Bill month is required." });
  else if (Number(body.billMonth) < 1 || Number(body.billMonth) > 12) {
    errors.push({ field: "billMonth", message: "Bill month must be between 1 and 12." });
  }
  if (isEmpty(body.billYear)) errors.push({ field: "billYear", message: "Bill year is required." });
  if (isEmpty(body.dueDate)) errors.push({ field: "dueDate", message: "Due date is required." });
  else if (!isValidDate(body.dueDate)) errors.push({ field: "dueDate", message: "Due date is not a valid date." });
  return errors;
}

module.exports = { generateBillValidator };
