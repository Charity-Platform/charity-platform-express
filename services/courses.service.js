const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const { uploadSingleImage } = require("../middlewares/uploadImages");
const Course = require("../models/course.model");
const Mentor = require("../models/mentor.model");
const factory = require("./handlers.factory");
const CourseRequest = require("../models/courses.payment.records");
const { subscribed } = require("../middlewares/check.subscription");
const { generateKey } = require("crypto");
exports.uploadCourseImage = uploadSingleImage("image");

exports.getCourseRequestById = async (req, res, next) => {
  try {
    const courseRequest = await CourseRequest.findById(req.params.id).populate({
      path: "course user",
      select: "title name phone email ",
    });
    if (!courseRequest) {
      return next(
        new ApiError(
          `the course request for this id ${req.params.id} is not exist`
        )
      );
    }
    res
      .status(200)
      .json({ message: "Course request found successfully", courseRequest });
  } catch (error) {
    console.error("Error occurred while getting course request:", error);
    res
      .status(500)
      .json({ error: "Failed to get course request", details: error.message });
  }
};

exports.deleteCourseRequest = factory.deleteOne(CourseRequest);

exports.getAllCourseRequests = async (req, res) => {
  try {
    const courseRequests = await CourseRequest.find()
      .populate({
        path: "course user",
        select: "title name -_id",
      })
      .select("user");
    if (!courseRequests) {
      return next(
        new ApiError(
          `the course request for this id ${req.params.id} is not exist`
        )
      );
    }
    res.status(200).json({
      success: true,
      length: courseRequests.length,
      data: courseRequests,
    });
  } catch (error) {
    console.error("Error occurred while getting course request:", error);
    res
      .status(500)
      .json({ error: "Failed to get course request", details: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { body, user } = req;
    const newCourse = new Course(body);
    newCourse.owner = user.id;
    await newCourse.save();
    await Mentor.findByIdAndUpdate(
      user.id,
      { $push: { courses: newCourse._id } },
      { new: true }
    );
    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    console.error("Error occurred while creating course:", error);
    res
      .status(500)
      .json({ error: "Failed to create course", details: error.message });
  }
};
exports.updateCourse = factory.updateOne(Course);

exports.deleteCourse = factory.deleteOne(Course);

exports.getCourseById = asyncHandler(async (req, res, next) => {
  const document = await Course.findById(req.params.id).populate({
    path: "videos",
    select: "title description url",
  });
  if (!document)
    return next(
      new ApiError(`the Document  for this id ${req.params.id} not found `, 404)
    );
  res.status(200).json(document);
});

exports.getAllCourses = factory.getAll(Course);

exports.getLoggedMentorCourses = asyncHandler(async (req, res, next) => {
  const course = await Course.find({
    owner: req.user.id,
  });
  if (!course) {
    return next(
      new ApiError(`The course for this mentor ${req.user.id} were not found`)
    );
  }
  res.status(200).json({ length: course.length, data: course });
});

exports.getAllCoursesForField = asyncHandler(async (req, res, next) => {
  try {
    let filterObj = {};

    if (req.query.field) {
      filterObj.field = req.query.field;
    }
    if (req.query.field === "selectAll") {
      filterObj = {};
    }
    const courses = await Course.find(filterObj);

    // Return courses
    res.status(200).json({ length: courses.length, data: courses });
  } catch (error) {
    // Handle other errors
    return next(new ApiError(`Error retrieving courses: ${error.message}`));
  }
});

exports.getAllCoursesForMentor = asyncHandler(async (req, res, next) => {
  const mentor = await Mentor.findById(req.params.mentor);
  if (!mentor) {
    return next(
      new ApiError(
        `The mentor ${req.params.mentor} was not found in the database`
      )
    );
  }
  const courses = await Course.find({
    owner: req.params.mentor,
  });
  if (!courses) {
    return next(
      new ApiError(
        `The courses for this mentor ${req.params.mentor} were not found`
      )
    );
  }
  res.status(200).json({ length: courses.length, data: courses });
});

exports.checksubscribed = subscribed(Course);
