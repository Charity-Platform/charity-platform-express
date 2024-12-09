const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const Book = require("../models/book.model");
const factory = require("./handlers.factory");
const { subscribed } = require("../middlewares/check.subscription");
const { uploadMixOfImages } = require("../middlewares/imagesAndFilesProcess");
const { getDecryptData, postPaymentData } = require("../utils/helpers");
const Payments = require("../models/paymentRecords");
const BookRequest = require("../models/bookRequestModel");
const Mentor = require("../models/mentor.model");
const { response } = require("express");

exports.uploadBookImgsAndFile = uploadMixOfImages([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "pdf",
    maxCount: 1,
  },
  {
    name: "review",
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

exports.reviewBookById = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).select(
    "review title price image description"
  );
  if (!book) {
    return next(
      new ApiError(`The book with ID ${req.params.id} does not exist`)
    );
  }
  res.status(200).json(book);
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
    .select("title image description price owner review ")
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
  const { id } = req.params;

  // Retrieve document based on ID from the Book model
  const document = await Book.findOne({ _id: id });

  // Check if the document exists, if not, send a 404 error
  if (!document) {
    return next(new ApiError(`The document for this id ${id} not found`, 404));
  }

  // Check if the user already owns the book
  const userAlreadyOwnsBook = await Book.findOne({
    _id: id,
    paidUsers: req.user._id,
  });
  if (userAlreadyOwnsBook) {
    return next(new ApiError(`You already own this book`, 400));
  }

  // Check if the user has already paid for this document when using online payment
  const paidUsersDocument = await Book.findOne({ id }).select("paidUsers");
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
    responseUrl: `${process.env.responseUrl}/auth/request/payment/book/${id}`,
    failureUrl: `${process.env.failureUrl}/auth/request/payment/book/${id}`,
    version: "2",
    orderReferenceNumber: id,
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

exports.bookPaymentCheckout = asyncHandler(async (req, res, next) => {
  const result = getDecryptData(req.params.data);
  console.log(result.response);
  if (result.status) {
    const payment = await Payments.findOne({
      refId: result.response.variable3,
    });
    // if (payment) {
    //   return next(new ApiError("expired payment token", 401));
    // }
    const paymentid = new Payments({
      refId: result.response.variable3,
    });
    await paymentid.save();

    const book = await Book.findByIdAndUpdate(
      result.response.orderReferenceNumber,
      {
        $push: { paidUsers: req.user.id },
      },
      { new: true }
    );
    //check the payment method
    let method;
    if (result.response.method === 0) {
      method = "Indirect";
    } else if (result.response.method === 1) {
      method = "Knet";
    } else if (result.response.method === 2) {
      method = "MPGS";
    }
    // save the request into DB
    const bookRequest = new BookRequest({
      user: req.user,
      book: result.response.orderReferenceNumber,
      type: result.response.variable1,
      amount: result.response.amount,
      paymentMethod: method,
      paymentId: result.response.paymentId,
      paidOn: result.response.paidOn,
    });
    await bookRequest.save();
    // const book = await Book.findByIdAndUpdate(
    //   response.data.orderReferenceNumber,
    //   {
    //     $push: { paidUsers: req.user.id },
    //   },
    //   { new: true }
    // );
    req.user.books.push(result.response.orderReferenceNumber);
    await req.user.save();
    const mentor = await Mentor.findById(book.owner);
    const { fees } = mentor;
    let amount = result.response.amount / 100;
    amount = amount - amount * (fees / 100);
    await Mentor.findByIdAndUpdate(
      book.owner,
      { $inc: { balance: amount } },
      { new: true }
    );
    res.status(201).json({ Message: "book payment success" });
  } else {
    return next(new ApiError(`Payment failed`, 400));
  }
});
