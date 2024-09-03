const mongoose = require("mongoose");
const { Company } = require("sib-api-v3-sdk");

const CourseRequestSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userIP: String,
  status: String,
  amount: Number,
  invoice_id: String,
  paidOn: Date,
  paymentGatewayFees: String,
  type: String,
  company: String,
  cardNumber: String,
});

const CourseRequest = mongoose.model("CourseRequest", CourseRequestSchema);

module.exports = CourseRequest;
