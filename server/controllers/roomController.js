const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const roomService = require("../services/roomService");

const getRooms = asyncHandler(async (req, res) => {
  const result = await roomService.listRooms(req.query);
  success(res, { message: "Rooms fetched.", data: result });
});

const getRoom = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  success(res, { message: "Room fetched.", data: room });
});

const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.body, req.user);
  success(res, { message: "Room created successfully.", data: room, statusCode: 201 });
});

const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body, req.user);
  success(res, { message: "Room updated successfully.", data: room });
});

const updateRoomStatus = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoomStatus(req.params.id, req.body.status, req.user);
  success(res, { message: "Room status updated.", data: room });
});

module.exports = { getRooms, getRoom, createRoom, updateRoom, updateRoomStatus };
