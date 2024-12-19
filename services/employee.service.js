const factory = require("./handlers.factory");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const EmployeeRequest = require("../models/employee.model");
const { uploadMixOfImages } = require("../middlewares/imagesAndFilesProcess");
const path = require("path");

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
exports.createEmployeeRequest = factory.createOne(EmployeeRequest);

exports.getEmployeeRequests = asyncHandler(async (req, res, next) => {
  const document = await EmployeeRequest.find().select(
    "name image department phone description"
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

exports.getEmployeeRequestById = asyncHandler(async (req, res, next) => {
  const document = await EmployeeRequest.findById(req.params.id);
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

exports.updateEmployeeRequest = factory.updateOne(EmployeeRequest);

exports.deleteEmployeeRequest = factory.deleteOne(EmployeeRequest);
