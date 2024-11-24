const mongoose = require("mongoose");

const jobSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      required: [true, "Job type is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    campanyWebsite: {
      type: String,
      required: [true, "Company website is required"],
      trim: true,
    },
    companyPhone: {
      type: String,
      required: [true, "Company phone number is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
