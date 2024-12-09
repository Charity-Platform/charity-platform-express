const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const factory = require("./handlers.factory");
const Job = require("../models/job.model");
const JobApp = require("../models/job-app.model");
const { uploadMixOfImages } = require("../middlewares/imagesAndFilesProcess");

exports.uploadProfileImageAndPdf = uploadMixOfImages([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "pdf",
    maxCount: 1,
  },
]);
exports.createJob = factory.createOne(Job);

exports.deleteJob = factory.deleteOne(Job);

exports.getJobById = factory.getOne(Job);

exports.getAllActiveJobs = asyncHandler(async (req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: true }).select("title type name");
    res.status(200).json(jobs);
  } catch (error) {
    next(new ApiError(error.message, 500));
    console.log(error);
  }
});

exports.getAllNotActiveJobs = asyncHandler(async (req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: false });
    res.status(200).json(jobs);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});

exports.updateJob = factory.updateOne(Job);

exports.jobApply = asyncHandler(async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job)
      return next(
        new ApiError(`The job with ID ${req.params.id} does not exist`, 404)
      );
    const jobApp = await JobApp.create(req.body);
    jobApp.save();

    res.status(200).json(job);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});

exports.getAllApplicationsForAjob = asyncHandler(async (req, res) => {
  const applications = await JobApp.find({ job: req.params.jobId });
  res.status(200).json({ applications, count: applications.length });
});
