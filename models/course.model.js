const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: { type: String, required: true },
  videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  paidUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
  price: { type: Number, required: true },
  image: { type: String, required: [true, "Course image is required"] },
  description: String,
  field: String,
  promo: String,
});

const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
