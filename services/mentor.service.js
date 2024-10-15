const Mentor = require("../models/mentor.model");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const DepositeRequest = require("../models/deposite.model");

exports.unActivateMentor = asyncHandler(async (req, res, next) => {
  const mentor = await Mentor.findByIdAndUpdate(
    req.params.id,
    { accepted: false },
    { new: true }
  );

  if (!mentor) {
    return next(new ApiError(`No mentor found for ID ${req.params.id}`, 404));
  }
  res.status(200).json({ data: mentor });
});

exports.acceptmentor = asyncHandler(async (req, res, next) => {
  const mentor = await Mentor.findByIdAndUpdate(
    req.params.id,
    { accepted: true, fees: req.body.fees },
    { new: true }
  );

  if (!mentor) {
    return next(new ApiError(`No mentor found for ID ${req.params.id}`, 404));
  }
  res.status(200).json({ data: mentor });
});

exports.getMentorById = asyncHandler(async (req, res, next) => {
  const mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    return next(new ApiError(`No mentor found for ID ${req.params.id}`, 404));
  }
  res.status(200).json({ data: mentor });
});

exports.getAllActiveMentors = asyncHandler(async (req, res, next) => {
  const mentors = await Mentor.find({ accepted: true }).select(
    "name phone email field  accepted image courses address"
  );

  if (mentors.length === 0) {
    return res.status(404).json({ message: "No active mentors found." });
  }

  res.status(200).json({
    message: "Active mentors retrieved successfully",
    length: mentors.length,
    data: mentors,
  });
});

exports.getAllNotActiveMentors = asyncHandler(async (req, res, next) => {
  const mentors = await Mentor.find({ accepted: false }).select(
    "name phone email field active"
  );

  if (mentors.length === 0) {
    return res.status(404).json({ message: "No not active mentors found." });
  }

  res.status(200).json({
    message: "Not active mentors retrieved successfully",
    length: mentors.length,
    data: mentors,
  });
});

exports.getMentorsByField = async (req, res, next) => {
  try {
    let filterObject = {};
    if (req.query.field) {
      filterObject.field = req.query.field;
    }
    if (req.query.field === "selectAll") {
      filterObject = {};
    }
    const mentors = await Mentor.find(filterObject).select(
      "name phone email field image"
    );

    res.status(200).json({ mentors });
  } catch (error) {
    console.error("Error retrieving mentors by field:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---------- DEPSITES -----------------//
exports.depositeRequest = asyncHandler(async (req, res, next) => {
  const { equity } = req.body;
  if (req.user.balance < equity) {
    return next(
      new ApiError(
        `insufficient balance , your current balance is${req.user.balance}`,
        401
      )
    );
  }
  const depositeRequest = new DepositeRequest({
    mentor: req.user,
    equity: equity,
  });
  await depositeRequest.save();

  res.status(200).json({
    message: `Deposite request saved successfully`,
    depositeRequest: depositeRequest,
  });
});

exports.getAcceptedDepostes = asyncHandler(async (req, res) => {
  const accepted = await DepositeRequest.find({ accepted: true });
  res.status(200).json({ data: accepted });
});

exports.getNotAcceptedDepostes = asyncHandler(async (req, res) => {
  const notAccepted = await DepositeRequest.find({ accepted: false });
  res.status(200).json({ data: notAccepted });
});
exports.getDeposteRequestByID = asyncHandler(async (req, res) => {
  const deposteRequest = await DepositeRequest.findById(req.query.id).populate({
    path: "mentor",
    select: "name email address email phone balance fees socilaMedia ",
  });
  if (!deposteRequest) {
    return next(
      new ApiError(`No deposteRequest found for ID ${req.query.id}`, 404)
    );
  }
  res.status(200).json({ data: deposteRequest });
});

exports.acceptDepositRequest = asyncHandler(async (req, res, next) => {
  const depositRequest = await DepositeRequest.findByIdAndUpdate(
    req.query.id,
    { accepted: true },
    { new: true }
  );
  if (!depositRequest) {
    return next(
      new ApiError(`No deposit request found for ID ${req.query.id}`, 404)
    );
  }

  const mentor = await Mentor.findById(depositRequest.mentor);
  if (!mentor) {
    return next(
      new ApiError(`No mentor found for ID ${depositRequest.mentor}`, 404)
    );
  }

  mentor.balance = mentor.balance - depositRequest.equity;
  await mentor.save();

  res.status(200).json({ data: depositRequest, mentorBalance: mentor.balance });
});
