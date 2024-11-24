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

exports.getAllFreeBooks = asyncHandler(async (req, res, next) => {
  const document = await Book.find({ isFree: true });
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

exports.getAllPaidBooks = asyncHandler(async (req, res, next) => {
  const document = await Book.find({ isFree: false });
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

exports.getAllBooksForMentor = asyncHandler(async (req, res, next) => {
  const books = await Book.find({
    owner: req.params.mentorID,
  });
  if (!books) {
    return next(
      new ApiError(
        `The books for this mentor ${req.params.mentor} were not found`
      )
    );
  }
  res.status(200).json({ length: books.length, data: books });
});
exports.checksubscribed = subscribed(Book);

exports.bookPaymentSession = asyncHandler(async (req, res, next) => {
  // Retrieve document based on ID from the Book model
  const document = await Book.findOne({ _id: req.params.id });

  // Check if the document exists, if not, send a 404 error
  if (!document) {
    return next(
      new ApiError(`The document for this id ${req.params.id} not found`, 404)
    );
  }

  // Check if the user has already paid for this document when using online payment
  const paidUsersDocument = await Book.findOne({ _id: req.params.id }).select(
    "paidUsers"
  );
  if (
    paidUsersDocument &&
    paidUsersDocument.paidUsers &&
    paidUsersDocument.paidUsers
      .map((user) => user.toString())
      .includes(req.user.id)
  ) {
    return next(new ApiError(`You already own this item`, 401));
  }

  // Prepare payment data for postPaymentData function
  const data = {
    merchantCode: `${process.env.merchantCode}`,
    amount: document.price,
    paymentType: "0",
    responseUrl: `${process.env.responseUrl}/auth/request/payment/book`,
    failureUrl: `${process.env.failureUrl}/auth/request/payment/book`,
    version: "2",
    orderReferenceNumber: req.params.id,
    currency: "KWD",
    variable3: req.user.id + Date.now(),
    name: req.user.name,
    email: req.user.email,
    mobile_number: req.user.phone,
    saveCard: true,
  };

  // Call the postPaymentData function and send the response to the client
  const response = await postPaymentData(data);
  res.status(200).json({ status: "success", data: response });
});
