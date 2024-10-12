const express = require("express");
const router = express.Router();

const {
  createPost,
  uploadPostImages,
  getAllPosts,
  updatePost,
  deletePost,
} = require("../services/post.service");
const { saveFilesNameToDB } = require("../middlewares/imagesAndFilesProcess");
const { protect } = require("../services/auth.service");

router.post("/", protect, uploadPostImages, saveFilesNameToDB, createPost);

router.get("/", getAllPosts);

router.put("/:id", uploadPostImages, saveFilesNameToDB, updatePost);

router.delete("/:id", deletePost);

module.exports = router;
