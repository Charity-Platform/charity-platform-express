const express = require("express");

const router = express.Router();

const {
  createJob,
  deleteJob,
  getJobById,
  getAllActiveJobs,
  getAllNotActiveJobs,
  updateJob,
} = require("../services/job.service");

const { allowedTo, protect } = require("../services/auth.service");

// Public routes
router.get("/active", getAllActiveJobs);
router.get("/not-active", getAllNotActiveJobs);

// Create a new job
router.post("/", createJob);

// Get a job by ID
router.get("/:id", getJobById);

// Update a job
router.patch(
  "/:id",
  //  protect, allowedTo("manager", "admin"),
  updateJob
);

// Delete a job
router.delete(
  "/:id",
  //  protect, allowedTo("manager", "admin"),
  deleteJob
);

module.exports = router;
