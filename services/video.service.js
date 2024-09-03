const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const { uploadSingleImage } = require("../middlewares/uploadImages");
const Video = require("../models/video.model");
const factory = require("./handlers.factory");
const Course = require("../models/course.model");
exports.uploadVideoImage = uploadSingleImage("image");

exports.createVideo = asyncHandler(async (req, res, next) => {
  try {
    const video = new Video(req.body);
    const course = await Course.findById(req.body.course);
    if (!course) {
      return next(
        new ApiError(`the course for this id ${req.body.course} is not exist`)
      );
    }
    await video.save();
    await Course.findByIdAndUpdate(
      req.body.course,
      {
        $push: { videos: video },
      },
      {
        new: true,
      }
    );
    res.status(201).json({ message: "created successfully", course });
  } catch (error) {
    console.error("Error occurred while creating:", error);
    res.status(500).json({
      error: "Error occurred while creating",
      details: error.message,
    });
  }
});

exports.updateVideo = factory.updateOne(Video);

exports.deleteVideo = factory.deleteOne(Video);

exports.getVideoById = factory.getOne(Video);

exports.getAllVideos = asyncHandler(async (req, res, next) => {
  let filterObject = {};
  if (req.params.playlistId) filterObject = { playlist: req.params.playlistId };
  req.filterObj = filterObject;

  const PAGE_SIZE = 5;

  // Extract page number from request query, default to 1 if not provided
  const page = parseInt(req.query.page, 10) || 1;

  // Calculate the number of messages to skip
  const skip = (page - 1) * PAGE_SIZE;

  // Fetch videos with pagination and limit to PAGE_SIZE
  const document = await Video.find(filterObject)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE);

  if (!document) {
    return next(new ApiError(`Error happened`, 404));
  }

  if (document.length === 0) {
    return res.status(200).json({ message: "There is NO data to retrieve" });
  }

  res.status(200).json({
    message: "Videos retrieved successfully",
    length: document.length,
    page: page,
    document,
  });
});
