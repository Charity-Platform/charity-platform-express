const mongoose = require("mongoose");
const jobAppSchema = new mongoose.Schema({
  image: String,
  fullName: String,
  email: String,
  phone: String,
  age: Number,
  yearsOfExperience: String,
  coverLitter: String,
  pdf: String,
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
});
const JobApp = mongoose.model("JobApp", jobAppSchema);
module.exports = JobApp;
