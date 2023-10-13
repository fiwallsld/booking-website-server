// const users = [{ username: "abcd", password: "123456" }];
const User = require("../models/user");
const Transaction = require("../models/transaction");

exports.postAuthen = async (req, res, next) => {
  const isLogin = req.query.mode === "login";
  const data = req.body.data;
  data.isAdmin = false;

  // let resData = {};
  const errorDataInput = validateForm(data, isLogin);

  //--------------Check data input--------------------//
  //--------if has error -> return -----------------------//
  if (Object.keys(errorDataInput).length !== 0) {
    // console.log("Du lieu khong hop le");
    return res.status(401).json(errorDataInput);
  }

  //-------------------Data validate-------------------------//
  //-----------------Perform login-----------------//
  if (isLogin) {
    // const { username, password } = req.body.data;
    // console.log(data.username);
    try {
      const user = await User.findOne({ username: data.username });

      if (!user) {
        errorDataInput.username = "Wrong, please check username";
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
  }

  //-----------------Perform sign up-----------------//
  if (!isLogin) {
    try {
      const exitingUser = await User.findOne({ username: data.username });

      if (exitingUser) {
        errorDataInput.username = "This account is exiting!";
        return res.status(400).json(errorDataInput);
      }

      const exitingEmail = await User.findOne({ email: data.email });
      if (exitingEmail) {
        errorDataInput.email = "This email is currently in use!";
        return res.status(400).json(errorDataInput);
      }

      const user = new User({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        isAdmin: data.isAdmin,
      });

      user.save().then(() => {
        // resData.mesSignUp = "Sing up new account success!";
        res.status(201).json({ mesSuccess: "Sing up new account success!" });
      });
    } catch (err) {
      res.status(500).json({ mesError: "Something went wrong!!!" });
    }
  }
};

exports.getLogout = (req, res, next) => {
  res.status(200).json({ mes: "Logout successfully!" });
};

exports.getTransaction = (req, res, next) => {
  const username = req.user?.username;
  if (!username) {
    return res.redirect("http://localhost:3000/login");
  }

  Transaction.find({ user: username })
    .populate("hotel")
    .then((trans) => {
      // console.log(trans);
      const resData = trans.map((tran) => {
        return {
          hotel: tran.hotel.name,
          room: tran.room,
          dateStart: tran.dateStart,
          dateEnd: tran.dateEnd,
          price: tran.price,
          payment: tran.payment,
          status: tran.status,
        };
      });

      return res.status(200).json(resData);
    });
};

function validateForm(data, isLogin) {
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

  //----------If signUp mode-----------//
  //----------check more data-----------//
  if (!isLogin) {
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
  }

  return errors;
}
