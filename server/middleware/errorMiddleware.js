const { error } = require("../utils/apiResponse");

function notFound(req, res, next) {
  error(res, { message: `Route not found: ${req.method} ${req.originalUrl}`, statusCode: 404 });
}

function multerMessage(err) {
  if (err.code === "LIMIT_FILE_SIZE") return "File is too large. Maximum size is 5MB.";
  if (err.code === "LIMIT_UNEXPECTED_FILE") return "Unexpected file field.";
  return "File upload failed. Please check the file and try again.";
}

function prismaMessage(err) {
  const fields = err.meta?.target;
  return fields ? `A record with this ${fields} already exists.` : "This record already exists.";
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "MulterError") {
    return error(res, { message: multerMessage(err), statusCode: 422 });
  }

  if (err.code === "P2002") {
    return error(res, { message: prismaMessage(err), statusCode: 409 });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? "Internal server error." : err.message || "Something went wrong.";

  return error(res, { message, statusCode, errors: err.errors || null });
}

module.exports = { notFound, errorHandler };
