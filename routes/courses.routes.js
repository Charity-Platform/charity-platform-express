// routes/CourseRoutes.js
const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getCourseById,
  uploadCourseImage,
  getAllCoursesForField,
  getAllCoursesForMentor,
  getLoggedMentorCourses,
  coursePaymentSession,
  checkoutPayment,
  getCourseRequestById,
  deleteCourseRequest,
  getAllCourseRequests,
  checksubscribed,
} = require("../services/courses.service");
const { saveSingleImage } = require("../middlewares/imageProcessing");
const { protect, allowedTo } = require("../services/auth.service");
const { checCoursesOwner } = require("../middlewares/check.course-owner");

router.get("/", getAllCourses);

router.post(
  "/",
  protect,
  // allowedTo("mentor", "manager"),
  uploadCourseImage,
  saveSingleImage,
  createCourse
);
// router.post("/payment/:id", protect, coursePaymentSession);

// router.post("/checkout/:id", protect, checkoutPayment);

// Get all tickets for field
router.get("/field", getAllCoursesForField);

// Get all tickets for mentor
router.get("/mentor/:mentor", getAllCoursesForMentor);

// Get all tickets for logged mentor
router.get("/my-courses", protect, getLoggedMentorCourses);

router.get("/request", protect, getAllCourseRequests);

router.get("/request/:id", protect, getCourseRequestById);

router.delete("/request/:id", protect, deleteCourseRequest);

router.get("/:id", protect, checksubscribed, getCourseById);

router.put("/:id", protect, checCoursesOwner, uploadCourseImage, updateCourse);

router.delete("/:id", protect,
  //  allowedTo("mentor", "manager"),
    deleteCourse);

module.exports = router;
