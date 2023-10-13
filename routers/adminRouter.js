const express = require("express");

const router = express.Router();

const adminControl = require("../controllers/adminControl");

router.postLogin = router.post("/auth", adminControl.postLogin);
router.getLogout = router.get("/logout", adminControl.getLogout);
router.getInfoBoard = router.get("/info-board", adminControl.getInfoBoard);

router.getHotels = router.get("/hotels", adminControl.getHotels);
router.postAddHotel = router.post("/hotels", adminControl.postAddHotel);
router.postEditHotel = router.post(
  "/hotels/:hotelId",
  adminControl.postEditHotel
);
router.deleteHotel = router.delete(
  "/hotels/:hotelId",
  adminControl.deleteHotel
);

router.getRooms = router.get("/rooms", adminControl.getRooms);
router.postAddRoom = router.post("/rooms", adminControl.postAddRoom);
router.getHotelsIncludesRoom = router.get(
  "/hotels/:roomId",
  adminControl.getHotelsIncludesRoom
);
router.postEditRoom = router.post("/rooms/:roomId", adminControl.postEditRoom);
router.deleteRoom = router.delete("/rooms/:roomId", adminControl.deleteRoom);

router.getUsers = router.get("/users", adminControl.getUsers);
router.getEditUser = router.get("/users/:userId", adminControl.getEditUser);
router.postEditUser = router.post("/users/:userId", adminControl.postEditUser);
router.deleteUser = router.delete("/users/:userId", adminControl.deleteUser);

router.getTransactions = router.get(
  "/transactions",
  adminControl.getTransactions
);

module.exports = router;
