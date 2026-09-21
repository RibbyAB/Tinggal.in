const { error } = require("../utils/apiResponse");

// Tiny dependency-free validator. Each validator module exports a function
// that takes req.body and returns an array of { field, message } errors.
// Kept intentionally simple (no external library) so it's easy for a
// student to read and explain end-to-end.
function validate(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body || {});
    if (errors.length > 0) {
      return error(res, { message: "Validation failed.", statusCode: 422, errors });
    }
    next();
  };
}

const isEmpty = (v) => v === undefined || v === null || String(v).trim() === "";
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^[0-9+\-\s]{8,15}$/.test(v);
const isPositiveNumber = (v) => !isNaN(v) && Number(v) > 0;
const isValidDate = (v) => !isNaN(Date.parse(v));

module.exports = { validate, isEmpty, isEmail, isPhone, isPositiveNumber, isValidDate };
