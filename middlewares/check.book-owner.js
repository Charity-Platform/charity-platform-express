const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const Book = require("../models/book.model");

exports.checkBookOwner = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new ApiError(`The book with ID ${id} does not exist`));
  }

  if (book.owner.toString() !== req.user.id && req.user.role !== "manager") {
    return next(new ApiError(`You are not the owner of this book`));
  }
  next();
});
