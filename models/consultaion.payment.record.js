// models/ConsultationRequest.js
const mongoose = require("mongoose");

const consultationRequestSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsultationTicket",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
    required: true,
  },
  status: String,
  amount: Number,
  invoice_id: String,
  paidOn: Date,
  type: String,
  company: String,
});

const ConsultationRequest = mongoose.model(
  "ConsultationRequest",
  consultationRequestSchema
);

module.exports = ConsultationRequest;
