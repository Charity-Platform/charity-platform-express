const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/create.token");
const User = require("../models/user.model");
const Mentor = require("../models/mentor.model");
const { uploadSingleImage } = require("../middlewares/uploadImages");

exports.uploadProfileImage = uploadSingleImage("image");

exports.signup = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ email: req.body.email });
  const currentMentor = await Mentor.findOne({ email: req.body.email });

  if (currentUser || currentMentor) {
    return next(new ApiError(`sorry this user allready exists`, 401));
  }
  // 1- Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
  });

  // 2- Generate and send verification code to the user's email
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Save the verification code and its expiry time in the user model
  user.emailVerifyCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");
  user.emailVerifyExpiers = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // 3- Send the verification code via SMS
  const message = `Welcome to charity! Please use the provided verification code to activate your account`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Email Verification Code (valid for 10 min)",
      message,
      user: user.name,
      code: verificationCode,
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError("Error sending verification code", 500));
  }

  res.status(200).json({ message: "Verification code sent to your email" });
});

exports.signupMentor = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ email: req.body.email });
  const currentMentor = await Mentor.findOne({ email: req.body.email });

  if (currentUser || currentMentor) {
    return next(new ApiError(`sorry this user allready exists`, 401));
  }
  // 1- Create user
  const mentor = await Mentor.create({
    name: req.body.name,
    lname: req.body.lname,
    email: req.body.email,
    password: req.body.password,
    socialMedia: req.body.socialMedia,
    field: req.body.field,
    description: req.body.description,
    image: req.body.image,
    phone: req.body.phone,
    birthdate: req.body.birthdate,
    address: req.body.address,
  });

  // 2- Generate and send verification code to the user's email
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Save the verification code and its expiry time in the user model
  mentor.emailVerifyCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");
  mentor.emailVerifyExpiers = Date.now() + 10 * 60 * 1000; // 10 minutes
  await mentor.save();

  // 3- Send the verification code via SMS
  const message = `Welcome to charity! Please use the provided verification code to activate your account`;

  try {
    await sendEmail({
      email: mentor.email,
      subject: "Your Email Verification Code (valid for 10 min)",
      message,
      user: mentor.name,
      code: verificationCode,
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError("Error sending verification code", 500));
  }

  res.status(200).json({ message: "Verification code sent to your email" });
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  let token;
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.emailVerifyCode)
    .digest("hex");

  const user = await User.findOne({
    emailVerifyCode: hashedResetCode,
    emailVerifyExpiers: { $gt: Date.now() },
  });
  if (!user) {
    const mentor = await Mentor.findOne({
      emailVerifyCode: hashedResetCode,
      emailVerifyExpiers: { $gt: Date.now() },
    });
    if (!mentor) {
      return next(new ApiError("Reset code invalid or expired"));
    } else {
      mentor.emailVerified = true;
      await mentor.save();
      // 3) generate token
      token = createToken(mentor._id);
    }
  }

  // 2) Reset code valid
  if (user) {
    user.emailVerified = true;
    await user.save();
    // 3) generate token
    token = createToken(user._id);
  }

  // Save the token in the cookies
  res.cookie("jwt", token, {
    httpOnly: process.env.NODE_ENV !== "production",
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "Success",
  });
});

exports.resendVerificationCode = asyncHandler(async (req, res, next) => {
  // 2) Find user by email
  const user = await User.findOne({ email: req.body.email });
  const mentor = await Mentor.findOne({ email: req.body.email });
  if (!user && !mentor) {
    return next(new ApiError("User not found", 404));
  }
  // 4) Generate and send a new verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // 3) Check if the user's email is already verified
  if (user) {
    if (user.emailVerified) {
      return next(new ApiError("User email is already verified", 400));
    }

    // Save the new verification code and its expiry time in the user model
    user.emailVerifyCode = crypto
      .createHash("sha256")
      .update(verificationCode)
      .digest("hex");
    user.emailVerifyExpiers = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // 5) Send the new verification code via email
    const message = `You requested a new verification code for your charity account.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your Email Verify code (valid for 10 min)",
        message: message,
        user: user.name,
        code: verificationCode,
      });
    } catch (err) {
      console.error(err);
      return next(new ApiError("Error sending verification code", 500));
    }
  }

  if (mentor) {
    if (mentor.emailVerified) {
      return next(new ApiError("mentor email is already verified", 400));
    }

    // Save the new verification code and its expiry time in the mentor model
    mentor.emailVerifyCode = crypto
      .createHash("sha256")
      .update(verificationCode)
      .digest("hex");
    mentor.emailVerifyExpiers = Date.now() + 10 * 60 * 1000; // 10 minutes
    await mentor.save();

    // 5) Send the new verification code via email
    const message = `Hi ${mentor.name},
          \n You requested a new verification code for your charity account. Here it is:
          \n ${verificationCode} \n
          \n Thank you!
          \n The charity Team`;

    try {
      await sendEmail({
        email: mentor.email,
        subject: "Your Email Verify code (valid for 10 min)",
        message,
      });
    } catch (err) {
      console.error(err);
      return next(new ApiError("Error sending verification code", 500));
    }
  }

  res.status(200).json({ message: "New verification code sent to your email" });
});

// @desc    Login
// @route   GET /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  try {
    // 1) Check if email and password are in the request body
    if (!req.body.email || !req.body.password) {
      return next(new ApiError("Email and password are required", 400));
    }

    // 3) Find user by email
    const user = await User.findOne({ email: req.body.email });
    const mentor = await Mentor.findOne({ email: req.body.email });
    if (!user && !mentor) {
      return next(new ApiError("User not found", 404));
    }

    // 5) Check if the user is email verified
    if ((user && !user.emailVerified) || (mentor && !mentor.emailVerified)) {
      return next(new ApiError("Please verify your email first", 401));
    }

    // 6) Check if it's a mentor and if the account is accepted
    if (mentor && !mentor.accepted) {
      return next(
        new ApiError(
          "جاري مراجعة بيانات حسابك من قبل إدارة الموقع , برجاء محاولة تسجيل الدخول مرة أخري في وقت لاحق",
          401
        )
      );
    }

    // 7) Check if the password is correct
    const isValidPassword = user
      ? await bcrypt.compare(req.body.password, user.password)
      : await bcrypt.compare(req.body.password, mentor.password);

    if (!isValidPassword) {
      return next(new ApiError("Incorrect password", 401));
    }

    // 8) Generate token
    const token = createToken(user ? user._id : mentor._id);

    // 9) Save the token in the cookies
    res.cookie("jwt", token, {
      httpOnly: process.env.NODE_ENV !== "production",
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // 10) Extract specific properties from the user object
    const userData = user
      ? {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        }
      : {
          _id: mentor._id,
          name: mentor.name,
          email: mentor.email,
          role: mentor.role,
          image: mentor.image,
        };

    // 11) Send response to the client with specific properties
    res.status(200).json({ data: userData, token });
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return next(new ApiError("Internal Server Error", 500));
  }
});

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists in cookies
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please log in to access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  let currentUser;
  let currentMentor;

  // Check if the user exists
  currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    // If not, check if it's a mentor
    currentMentor = await Mentor.findById(decoded.userId);
  }

  if (!currentUser && !currentMentor) {
    return next(
      new ApiError("The user associated with this token no longer exists", 401)
    );
  }

  // 4) Check if user changed their password after token creation
  if (currentUser) {
    if (currentUser.passwordChangedAt) {
      const passChangedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );
      // Password changed after token creation (Error)
      if (passChangedTimestamp > decoded.iat) {
        return next(
          new ApiError(
            "User recently changed their password. Please log in again.",
            401
          )
        );
      }
    }
    req.user = currentUser;
  } else if (currentMentor) {
    if (currentMentor.passwordChangedAt) {
      const passChangedTimestamp = parseInt(
        currentMentor.passwordChangedAt.getTime() / 1000,
        10
      );
      // Password changed after token creation (Error)
      if (passChangedTimestamp > decoded.iat) {
        return next(
          new ApiError(
            "User recently changed their password. Please log in again.",
            401
          )
        );
      }
    }
    req.user = currentMentor;
  }

  next();
});

// @desc    Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc    Request password reset
// @route   POST /api/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  let user;
  let isUser = true;

  // Check if the email belongs to a user
  user = await User.findOne({ email: req.body.email });
  if (!user) {
    // If not, check if it belongs to a mentor
    user = await Mentor.findOne({ email: req.body.email });
    isUser = false;
  }

  if (!user) {
    return next(
      new ApiError(
        `There is no account associated with the email ${req.body.email}`,
        404
      )
    );
  }

  // Generate a random 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save the hashed reset code and its expiry time in the user model
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Send the reset code via email
  const message = `
You recently requested to reset your password on charity. Please use the following code to reset your password
If you didn't make this request, you can safely ignore this email.
`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
      code: resetCode,
      user: user.name,
    });
  } catch (err) {
    // If there's an error sending the email, clean up the user's reset data
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.error(err);
    return next(new ApiError("Error sending password reset code", 500));
  }

  // Respond with a success message
  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to your email" });
});

// @desc    Verify password reset code
// @route   POST /api/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  let user;
  let isUser = true;

  // Hash the reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // Check if the reset code belongs to a user
  user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    // If not, check if it belongs to a mentor
    user = await Mentor.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() },
    });
    isUser = false;
  }
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  // 3) generate token
  const token = createToken(user._id);

  // Save the token in the cookies
  res.cookie("jwt", token, {
    httpOnly: process.env.NODE_ENV !== "production",
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "Success",
    token,
  });
});

// @desc    Reset password
// @route   POST /api/auth/resetPassword
// @access  Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists in cookies
  let token = req.cookies.jwt;
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please log in to access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  let user;
  let isUser = true;

  // Check if the user exists
  user = await User.findById(decoded.userId);
  if (!user) {
    // If not, check if it's a mentor
    user = await Mentor.findById(decoded.userId);
    isUser = false;
  }

  if (!user) {
    return next(
      new ApiError("The user associated with this token no longer exists", 401)
    );
  }

  // 4) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  // Update password
  user.password = req.body.password;

  // Clear password reset fields
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 5) Generate a new token
  token = createToken(user._id);

  // Extract specific properties from the user object
  const { _id, name, email, role } = user;

  // 6) Send response to the client with specific properties
  res.status(200).json({ data: { _id, name, email, role }, token: token });
});

exports.logout = asyncHandler(async (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: process.env.NODE_ENV !== "production",
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ Message: "Logged out success" });
});
