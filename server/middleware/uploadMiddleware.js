const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const AppError = require("../utils/AppError");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "uploads", subfolder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
      cb(null, uniqueName);
    },
  });
}

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (!mimeOk || !extOk) {
    return cb(new AppError("Only JPEG, PNG, or WEBP images are allowed.", 422));
  }
  cb(null, true);
}

function buildUploader(subfolder) {
  return multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
}

const uploadPaymentProof = buildUploader("payments").single("proof");
const uploadComplaintImage = buildUploader("complaints").single("image");

module.exports = { uploadPaymentProof, uploadComplaintImage };
