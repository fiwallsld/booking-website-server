const express = require("express");

const router = express.Router();

//--------------Client route--------------//
const clientControl = require("../controllers/clientControl");

router.postAuthen = router.post("/auth", clientControl.postAuthen);
router.getLogout = router.get("/logout", clientControl.getLogout);
router.getTransaction = router.get(
  "/transaction",
  clientControl.getTransaction
);

//--------------Hotel route--------------//
const hotelsControl = require("../controllers/hotelsControl");

router.getHotels = router.get("/hotels", hotelsControl.getHotels);
router.getHotel = router.get("/hotels/:hotelId", hotelsControl.getHotel);

router.postSearchHotels = router.post(
  "/hotels/search",
  hotelsControl.postSearchHotels
);

router.postSearchAvailableRooms = router.post(
  "/hotels/search/:hotelId",
  hotelsControl.postSearchAvailableRooms
);

router.postBookHotel = router.post(
  "/hotels/:hotelId",
  hotelsControl.postBookHotel
);

module.exports = router;
