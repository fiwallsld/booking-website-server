const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  title: { type: String, unique: true, required: true },
  price: { type: Number, required: true },
  maxPeople: { type: Number, required: true },
  desc: { type: String, required: true },
  roomNumbers: { type: Array, required: true },
});

module.exports = mongoose.model("Room", roomSchema);
