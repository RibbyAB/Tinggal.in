const { isEmpty, isEmail, isPhone } = require("./validate");

function createTenantValidator(body) {
  const errors = [];
  if (isEmpty(body.name)) errors.push({ field: "name", message: "Name is required." });
  if (isEmpty(body.email)) errors.push({ field: "email", message: "Email is required." });
  else if (!isEmail(body.email)) errors.push({ field: "email", message: "Email is invalid." });
  if (!isEmpty(body.phone) && !isPhone(body.phone)) {
    errors.push({ field: "phone", message: "Phone number is invalid." });
  }
  if (isEmpty(body.password)) errors.push({ field: "password", message: "Password is required." });
  else if (String(body.password).length < 6) {
    errors.push({ field: "password", message: "Password must be at least 6 characters." });
  }
  return errors;
}

function updateTenantValidator(body) {
  const errors = [];
  if (body.email && !isEmail(body.email)) errors.push({ field: "email", message: "Email is invalid." });
  if (body.phone && !isPhone(body.phone)) errors.push({ field: "phone", message: "Phone number is invalid." });
  return errors;
}

module.exports = { createTenantValidator, updateTenantValidator };
