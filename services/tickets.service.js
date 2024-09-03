const asyncHandler = require("express-async-handler");
const factory = require("./handlers.factory");
const ConsultationTicket = require("../models/consultation.model");
const ApiError = require("../utils/api.error");
const ConsultationRequest = require("../models/consultaion.payment.record");

exports.createTicket = asyncHandler(async (req, res) => {
  try {
    const document = new ConsultationTicket(req.body);
    document.owner = req.user.id;
    document.field = req.user.field;
    await document.save();
    res.status(201).json({ message: "created successfully", document });
  } catch (error) {
    console.error("Error occurred while creating:", error);
    res.status(500).json({
      error: "Error occurred while creating",
      details: error.message,
    });
  }
});

exports.deleteTicket = factory.deleteOne(ConsultationTicket);

exports.getTicketById = factory.getOne(ConsultationTicket);

exports.getAllTicketsForField = asyncHandler(async (req, res, next) => {
  try {
    let filterObject = {
      isActive: true,
    };
    if (req.query.field) {
      filterObject = {
        field: req.query.field,
        isActive: true,
      };
    }
    if (req.query.field === "selectAll") {
      filterObject = {
        isActive: true,
      };
    }
    const tickets = await ConsultationTicket.find(filterObject).populate({
      path: "owner",
      select: "name",
    });

    // Return tickets
    res.status(200).json({ length: tickets.length, data: tickets });
  } catch (error) {
    // Handle other errors
    return next(new ApiError(`Error retrieving tickets: ${error.message}`));
  }
});

exports.getAllTicketsForMentor = asyncHandler(async (req, res, next) => {
  const tickets = await ConsultationTicket.find({
    owner: req.params.mentor,
  });
  if (!tickets) {
    return next(
      new ApiError(
        `The tickets for this mentor ${req.params.mentor} were not found`
      )
    );
  }
  res.status(200).json({ length: tickets.length, data: tickets });
});

exports.getLoggedMentorTickets = asyncHandler(async (req, res, next) => {
  const tickets = await ConsultationTicket.find({
    owner: req.user.id,
    isActive: true,
  });
  if (!tickets) {
    return next(
      new ApiError(`The tickets for this mentor ${req.user.id} were not found`)
    );
  }
  res.status(200).json({ length: tickets.length, data: tickets });
});

exports.getAllConsultRequests = asyncHandler(async (req, res, next) => {
  try {
    const consultRequest = await ConsultationRequest.find().populate({
      path: "user ticket",
      select: "title name -_id",
    });
    if (!consultRequest) {
      return next(new ApiError(`The consultation requests were not found`));
    }
    res
      .status(200)
      .json({ length: consultRequest.length, data: consultRequest });
  } catch (error) {
    // Handle other errors
    return next(
      new ApiError(`Error retrieving consultation requests: ${error.message}`)
    );
  }
});

exports.getConsultRequestById = asyncHandler(async (req, res, next) => {
  try {
    const consultRequest = await ConsultationRequest.findById(
      req.params.id
    ).populate({
      path: "user ticket mentor",
      select:
        "title name phone email price day field owner price birthdate owner",
    });
    if (!consultRequest) {
      return next(
        new ApiError(
          `The consultation request with ID ${req.params.id} does not exist`
        )
      );
    }
    res
      .status(200)
      .json({ length: consultRequest.length, data: consultRequest });
  } catch (error) {
    // Handle other errors
    return next(
      new ApiError(`Error retrieving consultation request: ${error.message}`)
    );
  }
});

exports.getLoggedMentorRequests = asyncHandler(async (req, res, next) => {
  const request = await ConsultationRequest.find({
    mentor: req.user.id,
  }).populate({
    path: "user ticket",
    select:
      "title name phone email price phone day owner price birthdate owner",
  });
  if (!request) {
    return next(
      new ApiError(
        `The consultaion requests for this mentor ${req.user.id} were not found`
      )
    );
  }
  res.status(200).json({ length: request.length, data: request });
});

exports.deleteConsultRequestById = factory.deleteOne(ConsultationRequest);

