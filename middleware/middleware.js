const User = require("../models/user");

exports.checkUser = (req, res, next) => {
  const username = req.headers.authorization || null;

  if (!username) {
    return res.redirect("http://localhost:3000/auth?mode=login");
  } else {
    User.findOne({ username: username })
      .then((user) => {
        console.log("User login is:--", username);
        req.user = user;
        next();
      })
      .catch((err) => console.log(err));
  }
};

exports.checkAdmin = (req, res, next) => {
  const username = req.headers.authorization || null;

  if (!username) {
    return next();
  } else {
    User.findOne({ username: username })
      .then((user) => {
        console.log("Admin login is:--", username);
        req.user = user;
        next();
      })
      .catch((err) => console.log(err));
  }
};
