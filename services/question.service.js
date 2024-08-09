const factory = require("./handlers.factory");
const Question = require("../models/question.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");

exports.createQuestion = factory.createOne(Question);

exports.deleteQuestion = factory.deleteOne(Question);

exports.getQuestionById = factory.getOne(Question);

exports.getAllQuestions = asyncHandler(async (req, res, next) => {
  const document = await Question.find().select(
    "title image description price  answer "
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

exports.updateQuestion = factory.updateOne(Question);
