// routes/VideoRoutes.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const { saveSingleImage } = require("../middlewares/imageProcessing");
const { checkVideoOwner } = require("../middlewares/check.video.owner");
const {
  createVideo,
  getAllVideos,
  updateVideo,
  deleteVideo,
  getVideoById,
  uploadVideoImage,
} = require("../services/video.service");
const { allowedTo, protect } = require("../services/auth.service");
const { checCoursekOwner } = require("../middlewares/check.course-owner");

router.use(protect);
// Route to create a new Video
router.post(
  "/",
  checCoursekOwner,
  uploadVideoImage,
  saveSingleImage,
  createVideo
);

// Route to get a Video by ID
router.get("/:id", getVideoById);

// Route to update a Video
router.put("/:id", allowedTo("mentor", "manager"), updateVideo);

// Route to delete a Video
router.delete("/:id", allowedTo("mentor", "manager"), deleteVideo);

// Export the router
module.exports = router;
