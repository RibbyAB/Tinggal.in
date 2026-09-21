const express = require("express");
const router = express.Router();

const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  updateRoomStatus,
} = require("../controllers/roomController");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { validate } = require("../validators/validate");
const { roomValidator } = require("../validators/roomValidator");

router.use(authenticateToken);

// All authenticated roles can view rooms (tenants need this to see the room
// catalog / their own room details).
router.get("/", getRooms);
router.get("/:id", getRoom);

// Only Owner/Admin manage rooms.
router.post("/", authorizeRoles("OWNER", "ADMIN"), validate(roomValidator), createRoom);
router.put("/:id", authorizeRoles("OWNER", "ADMIN"), updateRoom);
router.patch("/:id/status", authorizeRoles("OWNER", "ADMIN"), updateRoomStatus);

module.exports = router;
