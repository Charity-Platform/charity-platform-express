const mongoose = require("mongoose");
const jobAppSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  age: Number,
  yearsOfExperience: String,
  coverLitter: String,
  resume: String,
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
});

module.exports = mongoose.model("JobApp", jobAppSchema);
