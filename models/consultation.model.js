const mongoose = require("mongoose");

const consultationTicketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    startDate: {
      type: String,
      required: true,
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"],
    },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    day: {
      type: Date,
      default: Date.now,
      required: [true, "the ticket date is required "],
    },
    type: { type: String, enum: ["online", "offline"] },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: [true, "the mentor for this consultation is required"],
    },
    field: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ConsultationTicket = mongoose.model(
  "ConsultationTicket",
  consultationTicketSchema
);

module.exports = ConsultationTicket;
