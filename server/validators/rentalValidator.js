const { isEmpty, isValidDate } = require("./validate");

function createRentalValidator(body) {
  const errors = [];
  if (isEmpty(body.tenantId)) errors.push({ field: "tenantId", message: "Tenant is required." });
  if (isEmpty(body.roomId)) errors.push({ field: "roomId", message: "Room is required." });
  if (isEmpty(body.startDate)) errors.push({ field: "startDate", message: "Start date is required." });
  else if (!isValidDate(body.startDate)) errors.push({ field: "startDate", message: "Start date is invalid." });
  return errors;
}

module.exports = { createRentalValidator };
