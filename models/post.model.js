const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  image: String,
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});
const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
