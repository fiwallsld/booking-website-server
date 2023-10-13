const express = require("express");
const app = express();

//-------------Import cors------------------//
const cors = require("cors");

const corsUserOption = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  optionsSuccessStatus: 200,
  credentials: true,
};
const corsAdminOption = {
  origin: "http://localhost:3001",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  optionsSuccessStatus: 200,
  credentials: true,
};

//-------------Import body-parser------------------//
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//-------------Import mongodb------------------//
const mongoose = require("mongoose");
// const urlDb = "mongodb://localhost:27017/booking";

//-------------Import Middleware------------------//
const middleware = require("./middleware/middleware");

//-------------Import route------------------//
const clientRouter = require("./routers/clientRouter");
const adminRouter = require("./routers/adminRouter");
const errorController = require("./controllers/error");

app.use("/user", cors(corsUserOption));
app.use("/admin", cors(corsAdminOption));

// // -------------- User--------------
app.use("/user", middleware.checkUser);
app.use("/user", clientRouter);

// // -------------- Admin--------------
app.use("/admin", middleware.checkAdmin);
app.use("/admin", adminRouter);

// // -------------- Error--------------
app.use(errorController.get404);

//-------------ConnectDB-&-Run-App-----------//
mongoose
  .connect(
    "mongodb+srv://booking-website:booking-website@cluster0.fxowvpt.mongodb.net/booking-website?retryWrites=true&w=majority"
  )
  // .connect("mongodb://0.0.0.0:27017/booking")
  .then((result) => {
    app.listen(5000, () => {
      console.log("Server user running on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });