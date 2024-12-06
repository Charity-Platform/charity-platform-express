const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    image: {
      type: String,
      required: [true, "image is required"],
    },
    pdf: {
      type: String,
      required: [true, "pdf is required"],
    },
    review: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    fields: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
    paidUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isFree: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
