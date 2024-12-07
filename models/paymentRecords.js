const mongoose = require("mongoose");

const PaymentsSchema = new mongoose.Schema({
  refId: String,
  counter:Number,
});

const Payments = mongoose.model("Payments", PaymentsSchema);

module.exports = Payments;
