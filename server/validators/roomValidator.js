const { isEmpty, isPositiveNumber } = require("./validate");

const ROOM_TYPES = ["STANDARD", "DELUXE", "VIP"];

function roomValidator(body) {
  const errors = [];
  if (isEmpty(body.roomNumber)) errors.push({ field: "roomNumber", message: "Room number is required." });
  if (isEmpty(body.floor)) errors.push({ field: "floor", message: "Floor is required." });
  if (body.type && !ROOM_TYPES.includes(body.type)) {
    errors.push({ field: "type", message: `Type must be one of: ${ROOM_TYPES.join(", ")}` });
  }
  if (isEmpty(body.price) || !isPositiveNumber(body.price)) {
    errors.push({ field: "price", message: "Price must be a positive number." });
  }
  if (body.capacity !== undefined && Number(body.capacity) <= 0) {
    errors.push({ field: "capacity", message: "Capacity must be a positive number." });
  }
  return errors;
}

module.exports = { roomValidator };
