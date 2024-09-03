const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const Book = require("../models/book.model");
const factory = require("./handlers.factory");
const { subscribed } = require("../middlewares/check.subscription");
const { uploadMixOfImages } = require("../middlewares/imagesAndFilesProcess");

exports.uploadBookImgsAndFile = uploadMixOfImages([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "pdf",
    maxCount: 1,
  },
]);
exports.createBook = asyncHandler(async (req, res, next) => {
  try {
    const { body, user } = req;
    const book = new Book(body);
    book.owner = user.id;
    book.field = user.field;
    const document = await book.save();
    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});

exports.updateBook = factory.updateOne(Book);

exports.deleteBook = factory.deleteOne(Book);

exports.getBookById = factory.getOne(Book);

exports.getAllBooks = asyncHandler(async (req, res, next) => {
  const document = await Book.find()
    .select("title image description price owner ")
    .populate({
      path: "owner",
      select: "name",
    });
  if (!document) next(new ApiError(`Error Happend `, 404));
  if (document.length === 0) {
    res.status(200).json({ message: "There Is NO Data To Retrive" });
  } else {
    res.status(200).json({
      message: "Documents retrieved successfully",
      length: document.length,
      document,
    });
  }
});

exports.checksubscribed = subscribed(Book);


