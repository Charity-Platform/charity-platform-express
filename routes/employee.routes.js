const express = require("express");
const {
  createEmployeeRequest,
  getEmployeeRequests,
  getEmployeeRequestById,
  deleteEmployeeRequest,
  updateEmployeeRequest,
  uploadProfileImageAndPdf,
} = require("../services/employee.service");
const { saveFilesNameToDB } = require("../middlewares/imagesAndFilesProcess");
const router = express.Router();

// Create an employee request
router.post(
  "/",
  uploadProfileImageAndPdf,
  saveFilesNameToDB,
  createEmployeeRequest
);

// Get all employee requests
router.get("/", getEmployeeRequests);

// Get a specific employee request by ID
router.get("/:id", getEmployeeRequestById);

router.put(
  "/:id",
  uploadProfileImageAndPdf,
  saveFilesNameToDB,
  updateEmployeeRequest
);

// Delete an employee request by ID
router.delete("/:id", deleteEmployeeRequest);

module.exports = router;
