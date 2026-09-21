const { isEmpty } = require("./validate");

const CATEGORIES = ["ELECTRICITY", "WATER", "FACILITY", "CLEANLINESS", "SECURITY", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function createComplaintValidator(body) {
  const errors = [];
  if (isEmpty(body.title)) errors.push({ field: "title", message: "Title is required." });
  if (isEmpty(body.description)) errors.push({ field: "description", message: "Description is required." });
  if (body.category && !CATEGORIES.includes(body.category)) {
    errors.push({ field: "category", message: `Category must be one of: ${CATEGORIES.join(", ")}` });
  }
  if (body.priority && !PRIORITIES.includes(body.priority)) {
    errors.push({ field: "priority", message: `Priority must be one of: ${PRIORITIES.join(", ")}` });
  }
  return errors;
}

function updateComplaintStatusValidator(body) {
  const errors = [];
  if (isEmpty(body.status)) errors.push({ field: "status", message: "Status is required." });
  else if (!STATUSES.includes(body.status)) {
    errors.push({ field: "status", message: `Status must be one of: ${STATUSES.join(", ")}` });
  }
  return errors;
}

module.exports = { createComplaintValidator, updateComplaintStatusValidator };
