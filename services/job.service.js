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
