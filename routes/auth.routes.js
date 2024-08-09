const express = require("express");
const router = express.Router();
const { saveSingleImage } = require("../middlewares/imageProcessing");

const {
  signup,
  signupMentor,
  login,
  verifyEmail,
  forgotPassword,
  resendVerificationCode,
  verifyPassResetCode,
  resetPassword,
  logout,
  uploadProfileImage,
  protect,
} = require("../services/auth.service");

const {
  signupValidator,
  loginValidator,
  resetePasswordValidator,
} = require("../utils/validations/auth.validations");

router.post("/login", login);
router.post(
  "/signup",
  uploadProfileImage,
  saveSingleImage,
  signup
);
router.post(
  "/signup-mentor",
  uploadProfileImage,
  saveSingleImage,
  signupMentor
);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyPassResetCode);
router.put("/reset-password", resetePasswordValidator, resetPassword);
router.post("/logout", protect, logout);

module.exports = router;
