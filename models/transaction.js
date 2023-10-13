const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  user: { type: String, required: true, ref: "User" },
  hotel: { type: Schema.Types.ObjectId, required: true, ref: "Hotel" },
  room: [{ type: String, required: true, ref: "Room" }],
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  price: { type: String, required: true },
  payment: { type: String, required: true },
  status: { type: String, required: true },
});

module.exports = mongoose.model("Transaction", transactionSchema);
