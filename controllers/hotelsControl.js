const Hotels = require("../models/hotel");
const Transaction = require("../models/transaction");

exports.getHotels = async (req, res, next) => {
  Hotels.find().then((results) => {
    res.status(200).json(results);
  });
};

exports.getHotel = (req, res, next) => {
  const hotelId = req.params.hotelId;
  Hotels.findById(hotelId)
    .populate("rooms")
    .then((hotel) => {
      res.status(200).json(hotel);
    })
    .catch((err) => {
      res.status(404).json({ mes: "Not found this hotel!" });
    });
};

exports.postBookHotel = (req, res, next) => {
  if (!req.user) {
    return res.status(400).json({ mes: "You have to login for this function" });
  }

  const dataInput = {
    hotel: req.body.hotel || "",
    date: req.body.date[0] || "",
    fullName: req.body.fullName || "",
    email: req.body.email || "",
    phone: req.body.phone || "",
    card: req.body.card || "",
    rooms: req.body.rooms || "",
    payment: req.body.payment || "",
    price: req.body.price || "",
  };

  let errMes = validateForm(dataInput);

  console.log(errMes);
  if (Object.keys(errMes).length > 0) {
    return res.status(404).json(errMes);
  }

  console.log(dataInput);

  const totalDate =
    (new Date(dataInput.date.endDate) - new Date(dataInput.date.startDate)) /
      (1000 * 60 * 60 * 24) +
    1;

  const transaction = new Transaction({
    user: req.user.username,
    hotel: dataInput.hotel,
    room: dataInput.rooms,
    dateStart: dataInput.date.startDate,
    dateEnd: dataInput.date.endDate,
    price: dataInput.price,
    payment: dataInput.payment,
    status: "Checkin",
  });

  transaction.save().then(() => {
    return res.status(201).json({ mes: "Add book is successful!" });
  });
};

exports.postSearchHotels = (req, res, next) => {
  const city = req.body.destination;
  const totalInputRoom = +req.body.options.room;
  const checkInDate = new Date(req.body.date[0].startDate);
  const checkOutDate = new Date(req.body.date[0].endDate);
  const totalInputPeople = +req.body.options.adult + +req.body.options.children;

  // console.log(checkInDate, checkOutDate);
  Promise.all([
    Hotels.find().populate("rooms"),
    Transaction.find({
      $or: [
        {
          dateStart: {
            $gte: checkInDate,
            $lte: checkOutDate,
          },
        },
        {
          dateEnd: {
            $gte: checkInDate,
            $lte: checkOutDate,
          },
        },
        {
          dateStart: { $lte: checkOutDate },
          dateEnd: { $gte: checkInDate },
        },
      ],
    }),
  ]).then(([dataHotels, transaction]) => {
    const hotels = dataHotels.filter(
      (hotel) => hotel.city.toLowerCase() == city.toLowerCase()
    );

    if (hotels.length === 0) {
      return res.status(404).json({ mes: `Not found hotel in ${city}` });
    }

    const hotelMatch = hotels.filter((hotel) => {
      //-------------Tim cac phong cua KS da duoc dat truoc-------------------
      let listRoomBooked = [];
      transaction.forEach((trans) => {
        if (trans.hotel.toString() === hotel._id.toString()) {
          trans.room.forEach((roomNum) => listRoomBooked.push(roomNum));
        }
      });

      //----------Kiểm tra số phòng còn dư
      const availableRooms =
        hotel.rooms.reduce((sum, room) => sum + room.roomNumbers.length, 0) -
        listRoomBooked.length;

      //----------Kiểm tra số người có thể chứa
      const availablePeople = hotel.rooms.reduce(
        (sum, room) =>
          sum +
          room.maxPeople *
            room.roomNumbers.filter(
              (roomNum) => !listRoomBooked.includes(roomNum.toString())
            ).length,
        0
      );

      // console.log("Hotel:------", hotel.name);
      // console.log("available:----", availableRooms, availablePeople);
      // console.log("total:----", totalInputRoom, totalInputPeople);
      // console.log("-------------------------");

      return (
        availableRooms >= totalInputRoom && availablePeople >= totalInputPeople
      );
    });

    return res.status(200).json(hotelMatch);
  });
};

exports.postSearchAvailableRooms = (req, res, next) => {
  const checkInDate = new Date(req.body.date[0].startDate);
  const checkOutDate = new Date(req.body.date[0].endDate);

  const hotelId = req.body.hotel;

  Transaction.find({
    $and: [
      { hotel: hotelId },
      {
        $or: [
          {
            dateStart: {
              $gte: checkInDate,
              $lte: checkOutDate,
            },
          },
          {
            dateEnd: {
              $gte: checkInDate,
              $lte: checkOutDate,
            },
          },
          {
            dateStart: { $lte: checkOutDate },
            dateEnd: { $gte: checkInDate },
          },
        ],
      },
    ],
  }).then((transactions) => {
    // console.log("transactions-----", transactions);
    // console.log("------------------------------");

    let availableRooms = [];

    transactions.forEach((tran) => {
      tran.room.forEach((roomNum) => availableRooms.push(roomNum));
    });

    return res.status(200).json(availableRooms);
  });
};

function validateForm(data) {
  const errors = {};

  if (!data.fullName?.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "Invalid email format";
  }

  if (!data.phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = "Invalid phone number";
  }

  if (data.rooms.length === 0) {
    errors.rooms = "You must to chose least a room!!!";
  }

  if (!data.card?.trim()) {
    errors.card = "Card Number is required";
  }

  if (data.payment === "nothing" || data.payment === null) {
    errors.payment = "You must to chose payment method!!!";
  }

  return errors;
}
