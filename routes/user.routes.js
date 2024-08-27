const express = require("express");
const router = express.Router();

const {
  getUser,
  getLoggedUserData,
  updateLoggedUserData,
  getUsers,
  updateLoggedUserPassword,
  updateUserRole,
} = require("../services/user.service");
const { saveSingleImage } = require("../middlewares/imageProcessing");

const { allowedTo, protect, uploadProfileImage } = require("../services/auth.service");
router.use(protect);

router.get("/", getUsers);
router.get("/me", getLoggedUserData);
router.put("/updateMe",uploadProfileImage,
saveSingleImage, updateLoggedUserData);
router.put("/update-password", updateLoggedUserPassword);
router.put("/update-role", updateUserRole);

module.exports = router;
