const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const factory = require("./handlers.factory");
const Job = require("../models/job.model");

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
    const job = await Job.findByIdAndUpdate(req.params.id, {
      $push: { applications: req.body.userId },
    });
    if (!job)
      return next(new ApiError(`The job with ID ${req.params.id} does not exist`, 404));
    res.status(200).json(job);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
});
