const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const Course = require("../models/course.model");
// const Mentor = require("../models/Mentor.model");

exports.checCoursekOwner = asyncHandler(async (req, res, next) => {
  let courseID = {};
  if (req.body.course) {
    courseID = req.body.course;
  } else if (req.params.id) {
    courseID = req.params.id;
  } else {
    return next(new ApiError(`The course ID is not provided`));
  }

  const course = await Course.findById(courseID);
  if (!course) {
    return next(new ApiError(`The course with ID ${courseID} does not exist`));
  }

  if (course.owner.toString() !== req.user.id && req.user.role !== "manager") {
    return next(new ApiError(`You are not the owner of this course`));
  }

  next();
});
