const { isEmpty, isEmail } = require("./validate");

function loginValidator(body) {
  const errors = [];
  if (isEmpty(body.email)) errors.push({ field: "email", message: "Email is required." });
  else if (!isEmail(body.email)) errors.push({ field: "email", message: "Email is invalid." });
  if (isEmpty(body.password)) errors.push({ field: "password", message: "Password is required." });
  return errors;
}

module.exports = { loginValidator };
