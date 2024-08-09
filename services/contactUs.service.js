const ContactForm = require("../models/contactUs.model");
const factory = require("./handlers.factory");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");

exports.createContactForm = factory.createOne(ContactForm);

exports.deleteContactForm = factory.deleteOne(ContactForm);

exports.getContactFormById = factory.getOne(ContactForm);

exports.getAllContactForms = asyncHandler(async (req, res, next) => {
  const document = await ContactForm.find();
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

exports.deleteAllContactForms = factory.deleteAll(ContactForm);
