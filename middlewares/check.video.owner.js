const Video = require("../models/video.model");
const Course = require("../models/course.model");

exports.checkVideoOwner = async (req, res, next) => {
  const video = await Video.findById(req.params.id);
  const course = await Course.findById(video.course.toString());
  if (course.owner.toString() !== req.user.id && req.user.role !== "manager") {
    return next(new ApiError(`you are not the owner of this course`));
  }
  next();
};
