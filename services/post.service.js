const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const factory = require("./handlers.factory");
const { uploadMixOfImages } = require("../middlewares/imagesAndFilesProcess");
const Post = require("../models/post.model");
exports.uploadPostImages = uploadMixOfImages([
  {
    name: "image",
    maxCount: 5,
  },
]);
exports.createPost = asyncHandler(async (req, res, next) => {
  try {
    const { body, user } = req;
    const post = new Post(body);
    post.auther = user.id;
    const document = await post.save();
    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});

exports.deletePost = factory.deleteOne(Post);

exports.getAllPosts = factory.getAll(Post);

exports.updatePost = factory.updateOne(Post);
