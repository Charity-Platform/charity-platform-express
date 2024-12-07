const mongoose = require("mongoose");

const bookRequestSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  method: String,
  amount: Number,
  type: String,
  paymentMethod: String,
  paymentId: Number,
  paidOn: Date,
});

const BookRequest = mongoose.model("BookRequest", bookRequestSchema);

module.exports = BookRequest;
