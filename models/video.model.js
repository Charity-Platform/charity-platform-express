const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const videoSchema = new Schema(
  {
    title: {
      type: String,
    },
    url: {
      type: String,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "the course for this video is required"],
    },
    description: String,
    image: String,
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
