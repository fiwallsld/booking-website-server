const User = require("../models/user");
const Transaction = require("../models/transaction");
const Hotel = require("../models/hotel");
const Room = require("../models/room");

exports.postLogin = async (req, res, next) => {
  const data = req.body.data;
  const errorDataInput = validateForm(data);

  //--------------Check data input--------------------//
  //--------if has error -> return -----------------------//
  if (Object.keys(errorDataInput).length !== 0) {
    // console.log("Du lieu khong hop le");
    return res.status(401).json(errorDataInput);
  }

  //-----------------Perform login-----------------//
  try {
    const user = await User.findOne({ username: data.username });

    if (!user) {
      errorDataInput.username = "Wrong, please check username";
      return res.status(400).json(errorDataInput);
    }

    if (user.isAdmin !== true) {
      errorDataInput.username = "Please login by Admin account";
      return res.status(400).json(errorDataInput);
    }

    // Check password
    const passwordMatch = data.password === user.password;
    if (!passwordMatch) {
      errorDataInput.password = "Wrong, please check password";
      return res.status(401).json(errorDataInput);
    }

    req.user = user;
    res.status(200).json({ mesSuccess: "Login successfully!.", user: user });
  } catch (error) {
    res.status(500).json({ mesError: "Something went wrong!!!" });
  }
};

exports.getLogout = async (req, res, next) => {
  res.status(200).json({ mes: "Logout successfully!" });
};

exports.getInfoBoard = (req, res, next) => {
  Promise.all([User.find(), Transaction.find().populate("hotel")]).then(
    ([users, transactions]) => {
      // console.log(transactions);
      const totalUser = users.length;
      const totalEarning = transactions.reduce(
        (sum, tran) => sum + +tran.price,
        0
      );

      const eightTrans = transactions.slice(
        0,
        transactions.length < 8 ? transactions.length : 8
      );

      return res
        .status(200)
        .json({ users, transactions: eightTrans, totalEarning, totalUser });
    }
  );
};

//---------------Hotel control--------------//
exports.getHotels = (req, res, next) => {
  Hotel.find().then((hotels) => {
    return res.status(200).json({ hotels });
  });
};

exports.postAddHotel = (req, res, next) => {
  const data = req.body.data;

  const hotel = new Hotel({
    address: data.address,
    city: data.city,
    desc: data.description,
    distance: data.distance,
    featured: data.featured === "true" ? true : false,
    name: data.name,
    photos: data.imageUrl.split(" "),
    title: data.title,
    type: data.type,
    rating: 3,
  });

  hotel
    .save()
    .then(() => {
      return res.status(200).json({ mes: "Successfully!!!" });
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ message: "Hotel is exiting, check name of hotel" });
    });
};

exports.getHotel = (req, res, next) => {
  const userId = req.params.userId;
  User.findOne({ _id: userId }).then((user) => {
    return res.status(200).json({ user });
  });
};

exports.postEditHotel = (req, res, next) => {
  const hotelId = req.params.hotelId;

  const data = req.body.data;
  console.log("data input:", data);

  let rooms = data.rooms;
  if (typeof data.rooms === "string") {
    if (!data.rooms.indexOf(" ")) rooms = [data.rooms];
    else rooms = data.rooms?.split(" ");
  }

  Hotel.findById(hotelId)
    .then((hotel) => {
      // console.log(user);
      console.log("data:", hotel);
      hotel.name = data.name;
      hotel.city = data.city;
      hotel.distance = data.distance;
      hotel.desc = data.description;
      hotel.photos = data.imageUrl;
      hotel.rooms = rooms;
      hotel.type = data.type;
      hotel.title = data.title;
      hotel.featured = data.featured == "Yes";
      hotel.address = data.address;
      hotel.cheapestPrice = +data.price;

      return hotel.save();
    })
    .then((result) => {
      console.log("Update hotel success");
      res.status(200).json({ mes: "Update hotel success" });
    })
    .catch((err) => console.log(err));
};

//---------------Room control--------------//
exports.getRooms = (req, res, next) => {
  Room.find().then((rooms) => {
    return res.status(200).json({ rooms });
  });
};

exports.postAddRoom = (req, res, next) => {
  const data = req.body.data;
  const hotelName = data.hotel;

  const room = new Room({
    title: data.title,
    price: +data.price,
    desc: data.desc,
    maxPeople: data.maxPeople,
    roomNumbers: data.roomNumbers.split(" "),
  });

  if (!hotelName) {
    return res.status(400).json({ mes: "Please choose hotel!!!" });
  }

  Promise.all([room.save(), Hotel.findOne({ name: hotelName })])
    .then(([room, hotel]) => {
      console.log(room);
      console.log(hotel);
      hotel.rooms.push(room._id);

      return hotel.save();
    })
    .then(() => {
      return res.status(200).json({ mes: "Successfully!!!" });
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ message: "Hotel is exiting, check name of hotel" });
    });
};

exports.getHotelsIncludesRoom = (req, res, next) => {
  const roomId = req.params.roomId;
  Hotel.find().then((hotels) => {
    const listHotels = hotels.filter((hotel) => hotel.rooms?.includes(roomId));
    // console.log(listHotels);
    return res
      .status(200)
      .json({ hotels: listHotels.length === 0 ? hotels : listHotels });
  });
};
exports.postEditRoom = (req, res, next) => {
  const roomId = req.params.roomId;

  const data = req.body.data;
  // console.log("roomId:", roomId);
  // console.log("data:", data);
  let rooms = data.roomNumbers;
  if (typeof data.roomNumbers === "string") {
    rooms = data.roomNumbers.split(" ");
  }

  Room.findById(roomId)
    .then((room) => {
      room.title = data.title;
      room.price = +data.price;
      room.desc = data.desc;
      room.maxPeople = data.maxPeople;
      room.roomNumbers = rooms;

      return room.save();
    })
    .then((result) => {
      console.log("Update room success");
      res.status(200).json({ mes: "Update room success" });
    })
    .catch((err) => console.log(err));
};

//---------------User control--------------//
exports.getUsers = (req, res, next) => {
  User.find().then((users) => {
    return res.status(200).json({ users });
  });
};

exports.getEditUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findOne({ _id: userId }).then((user) => {
    return res.status(200).json({ user });
  });
};

exports.postEditUser = (req, res, next) => {
  const userId = req.params.userId;
  const updateUsername = req.body.data.username;
  const updatePassword = req.body.data.password;
  const updateConfirmPassword = req.body.data.confirmPassword;
  const data = {
    username: updateUsername,
    password: updatePassword,
    confirmPassword: updateConfirmPassword,
  };

  const errorDataInput = validateForm(data, true);
  //--------------Check data input--------------------//
  //--------if has error -> return -----------------------//
  if (Object.keys(errorDataInput).length !== 0) {
    return res.status(401).json(errorDataInput);
  }

  User.findById(userId)
    .then((user) => {
      console.log(user);
      user.username = updateUsername;
      user.password = updatePassword;
      return user.save();
    })
    .then((result) => {
      console.log("Update user success");
      res.status(200).json({ mes: "Update user success" });
    })
    .catch((err) => console.log(err));
};

exports.getTransactions = (req, res, next) => {
  Transaction.find()
    .populate("hotel")
    .then((transactions) => {
      return res.status(200).json({ transactions });
    });
};

//--------------------Delete---------------------//
exports.deleteHotel = (req, res, next) => {
  const hotelId = req.params.hotelId;

  Transaction.find({ hotel: hotelId }).then((transaction) => {
    // console.log(transaction);
    if (transaction.length > 0) {
      return res.status(400).json({ mes: "Hotel is already in Transactors" });
    }

    Hotel.findOneAndDelete({ _id: hotelId }).then(() => {
      Hotel.find().then((hotels) => {
        return res
          .status(200)
          .json({ mes: "Deleting is successfully", hotels: hotels });
      });
    });
  });
};

exports.deleteRoom = (req, res, next) => {
  const roomId = req.params.roomId;
  // console.log(":-----", roomId);

  Transaction.find()
    .populate("hotel")
    .then((transaction) => {
      let check = false;
      transaction.forEach((tran) => {
        tran.hotel.rooms.forEach((room) => {
          if (room.toString() == roomId) {
            check = true;
            return;
          }
        });
      });

      // console.log("check------------", check);
      if (check) {
        return res.status(400).json({ mes: "Room is already in Transactors" });
      } else {
        Room.findOneAndDelete({ _id: roomId }).then((result) => {
          // console.log(result);
          Room.find().then((rooms) => {
            return res
              .status(200)
              .json({ mes: "Deleting is successfully", rooms: rooms });
          });
        });
      }
    });
};

exports.deleteUser = (req, res, next) => {
  const userId = req.params.userId;

  Transaction.find({ user: userId }).then((transaction) => {
    // console.log(transaction);//
    if (transaction.length > 0) {
      return res.status(400).json({ mes: "User is already in Transactors" });
    }

    User.findOneAndDelete({ _id: userId }).then(() => {
      User.find().then((users) => {
        return res
          .status(200)
          .json({ mes: "Deleting user is successfully", users: users });
      });
    });
  });
};

function validateForm(data, isUpdate = false) {
  const errors = {};
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/;
  if (!data.username.trim()) {
    errors.username = "Username is required";
  } else if (!usernameRegex.test(data.username)) {
    errors.username = "Username is not valid!";
  }

  if (!data.password.trim()) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  if (isUpdate) {
    if (!data.confirmPassword.trim()) {
      errors.confirmPassword = "Password is required";
    } else if (data.confirmPassword.length < 6) {
      errors.confirmPassword = "Password must be at least 6 characters long";
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPassword =
        "Confirm password must be the same with password";
    }
  }

  return errors;
}
