const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/api.error");
const createToken = require("../utils/create.token");
const User = require("../models/user.model");
const Mentor = require("../models/mentor.model");
const { uploadSingleImage } = require("../middlewares/uploadImages");

exports.uploadProfileImage = uploadSingleImage("image");
exports.uploadPlaylistImage = uploadSingleImage("image");

exports.getUsers = asyncHandler(async (req, res, next) => {
  const document = await User.find({}).select("name email phone role ");
  if (!document) next(new ApiError(`Error Happend `, 404));
  if (document.length === 0) {
    res.status(200).json({ message: "There Is NO users To Retrive" });
  } else {
    res.status(200).json({
      message: "Documents retrieved successfully",
      results: document.length,
      document,
    });
  }
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(
      new ApiError(`the user  for this id ${req.params.id} not found `, 404)
    );
  // Extract specific properties from the user object
  const { name, lname, birthdate, _id, email, role } = user;

  // 4) send response to the client side with specific properties
  res.status(200).json({
    message: "user  retrieved successfully",
    data: {
      name,
      lname,
      birthdate,
      _id,
      email,
      active,
      role,
    },
  });
});

exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(201).json({ data: document });
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError("You are not logged in ", 401));
  }
  res.status(200).json(req.user);
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  let Model;
  if (req.user.role === "mentor") {
    Model = Mentor;
  } else {
    Model = User;
  }
  // 1) Update user password based user payload (req.user._id)
  const user = await Model.findByIdAndUpdate(
    req.user.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(user.id);

  res.status(201).json({ data: user, token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  let Model;
  if (req.user.role === "mentor") {
    Model = Mentor;
  } else {
    Model = User;
  }
  const updatedUser = await Model.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.body.image,
    },
    { new: true }
  );

  res.status(201).json({ data: updatedUser });
});
