const express = require("express");
const router = express.Router();

const {
  unActivateMentor,
  acceptmentor,
  getMentorById,
  getAllActiveMentors,
  getAllNotActiveMentors,
  getMentorsByField,
  depositeRequest,
  getAcceptedDepostes,
  getNotAcceptedDepostes,
  getDeposteRequestByID,
  acceptDepositRequest,
} = require("../services/mentor.service");
const { allowedTo, protect } = require("../services/auth.service");

router.get(
  "/not-active",
  protect,
  // allowedTo("manager", "admin"),
  getAllNotActiveMentors
);
router.post(
  "/unactivate/:id",
  protect,
  // allowedTo("manager", "admin"),
  unActivateMentor
);
router.post(
  "/accept/:id",
  protect,
  // allowedTo("manager", "admin"),
  acceptmentor
);

//deposite request
router.post("/deposite-request", protect, allowedTo("mentor"), depositeRequest);
router.post(
  "/accept-deposite/:id",
  protect,
  allowedTo("manager"),
  acceptDepositRequest
);
router.get(
  "/deposite-request/:id",
  protect,
  allowedTo("manager", "admin"),
  getDeposteRequestByID
);
router.get(
  "/accepted-deposites",
  protect,
  allowedTo("manager", "admin"),
  getAcceptedDepostes
);
router.get(
  "/pending-deposites",
  protect,
  allowedTo("manager", "admin"),
  getNotAcceptedDepostes
);
///////////
router.get("/active", getAllActiveMentors);
router.get("/field", getMentorsByField);

router.get("/:id", getMentorById);

module.exports = router;
