const mongoose = require("mongoose");

const contactFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      required: true,
      type: String,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      required: true,
      type: String,
    },
  },
  { timestamps: true }
);

const ContactForm = mongoose.model("ContactForm", contactFormSchema);

module.exports = ContactForm;
