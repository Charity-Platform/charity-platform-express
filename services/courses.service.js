const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const { uploadSingleImage } = require("../middlewares/uploadImages");
const Course = require("../models/course.model");
const Mentor = require("../models/mentor.model");
const factory = require("./handlers.factory");
const CourseRequest = require("../models/courses.payment.records");
const { subscribed } = require("../middlewares/check.subscription");
const { postPaymentData, getDecryptData } = require("../utils/helpers");
const Payments = require("../models/paymentRecords");
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

exports.getAllCourses = asyncHandler(async (req, res, next) => {
  const document = await Course.find().select(
    "title image description price body answer content auther courseLink field link"
  );
  if (!document) next(new ApiError(`Error Happend `, 404));
  if (document.length === 0) {
    res.status(200).json({ message: "There Is NO Data To Retrive" });
  } else {
    res.status(200).json({
      message: "Documents retrieved successfully",
      length: document.length,
      document,
    });
  }
});

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

exports.coursePaymentSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Retrieve document based on ID from the Book model
  const document = await Course.findOne({ _id: id });

  // Check if the document exists, if not, send a 404 error
  if (!document) {
    return next(new ApiError(`The document for this id ${id} not found`, 404));
  }

  // Check if the user already owns the book
  const userAlreadyOwnsCourse = await Course.findOne({
    _id: id,
    paidUsers: req.user._id,
  });
  if (userAlreadyOwnsCourse) {
    return next(new ApiError(`You already own this Course`, 400));
  }

  // Prepare payment data for postPaymentData function
  const data = {
    merchantCode: `${process.env.merchantCode}`,
    amount: document.price,
    paymentType: "0",
    responseUrl: `${process.env.responseUrl}/auth/payment/course/${document.id}`,
    failureUrl: `${process.env.failureUrl}/auth/payment/course/${document.id}`,
    version: "2",
    orderReferenceNumber: id,
    currency: "KWD",
    variable3: req.user.id + Date.now(),
    name: req.user.name,
    email: req.user.email,
    mobile_number: req.user.phone,
    saveCard: true,
  };

  // Call the postPaymentData function and send the response to the client
  const response = await postPaymentData(data);
  res.status(200).json({ status: "success", data: response });
});

exports.coursePaymentCheckout = asyncHandler(async (req, res, next) => {
  const result = getDecryptData(req.params.data);
  if (result.status) {
    const payment = await Payments.findOne({
      refId: result.response.variable3,
    });
    if (payment) {
      return next(new ApiError("expired payment token", 401));
    }
    const paymentid = new Payments({
      refId: result.response.variable3,
    });
    await paymentid.save();

    const course = await Course.findByIdAndUpdate(
      result.response.orderReferenceNumber,
      {
        $push: { paidUsers: req.user.id },
      },
      { new: true }
    );
    //check the payment method
    let method;
    if (result.response.method === 0) {
      method = "Indirect";
    } else if (result.response.method === 1) {
      method = "Knet";
    } else if (result.response.method === 2) {
      method = "MPGS";
    }

    req.user.courses.push(result.response.orderReferenceNumber);
    await req.user.save();
    const mentor = await Mentor.findById(course.owner);
    const { fees } = mentor;
    let amount = result.response.amount / 100;
    amount = amount - amount * (fees / 100);
    await Mentor.findByIdAndUpdate(
      course.owner,
      { $inc: { balance: amount } },
      { new: true }
    );
    res.status(201).json({
      Message: "course payment success",
      course: result.response.orderReferenceNumber, // Correct reference
    });
  } else {
    return next(new ApiError(`Payment failed`, 400));
  }
});
