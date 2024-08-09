const express = require("express");
const router = express.Router();
const {
  createField,
  updateField,
  deleteField,
  getAllFiedls,
} = require("../services/field.service");
const { protect, allowedTo } = require("../services/auth.service");
// Create a new field
router.post(
  "/",
  protect,
  // allowedTo("manager", "admin"),
  createField
);

// Get all fields
router.get("/", getAllFiedls);

// Update a field by ID
router.put(
  "/:id",
  protect,
  // allowedTo("manager", "admin"),
  updateField
);

// Delete a field by ID
router.delete(
  "/:id",
  protect,
  // allowedTo("manager", "admin"),
  deleteField
);

module.exports = router;
