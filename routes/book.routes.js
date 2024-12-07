const express = require("express");
const router = express.Router();
const { protect, allowedTo } = require("../services/auth.service");
const {
  bookPaymentSession,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  bookPaymentCheckout,
  uploadBookImgsAndFile,
  createBook,
  getAllBooksForMentor,
  getAllFreeBooks,
  getAllPaidBooks,
} = require("../services/book.service");
const { checksubscribed } = require("../services/book.service");
const { checkBookOwner } = require("../middlewares/check.book-owner");
const { saveFilesNameToDB } = require("../middlewares/imagesAndFilesProcess");

router.post("/payment/:id", protect, bookPaymentSession);
router.post("/payment/checkout/:data", protect, bookPaymentCheckout);

router.get("/", getAllBooks);
router.get("/free", getAllFreeBooks);
router.get("/paid", getAllPaidBooks);
router.get("/mentor/:mentorID", getAllBooksForMentor);

router.post(
  "/",
  protect,
  // allowedTo("mentor", "manager"),
  uploadBookImgsAndFile,
  saveFilesNameToDB,
  createBook
);

router.get("/:id", protect, checksubscribed, getBookById);

router.put(
  "/:id",
  protect,
  checkBookOwner,
  uploadBookImgsAndFile,
  saveFilesNameToDB,
  updateBook
);

router.delete("/:id", protect, checkBookOwner, deleteBook);

module.exports = router;
