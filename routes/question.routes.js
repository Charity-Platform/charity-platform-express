const express = require("express");

const router = express.Router();

const {
  createQuestion,
  getQuestionById,
  getAllQuestions,
  deleteQuestion,
  updateQuestion,
} = require("../services/question.service");

const { allowedTo, protect } = require("../services/auth.service");

// Create a new question
router.post("/", protect, allowedTo("manager", "admin"), createQuestion);

// Get all questions
router.get("/", getAllQuestions);

// Get question by id
router.get("/:id", getQuestionById);

// Update question by id
router.put("/:id", protect, allowedTo("manager", "admin"), updateQuestion);

// Delete question by id
router.delete("/:id", protect, allowedTo("manager", "admin"), deleteQuestion);

module.exports = router;
