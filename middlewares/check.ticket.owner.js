const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/api.error");
const ConsultationTicket = require("../models/consultation.model");

exports.checkTicketOwner = asyncHandler(async (req, res, next) => {
  const ticket = await ConsultationTicket.findById(req.params.id);
  if (!ticket) {
    return next(
      new ApiError(`The ticket with ID ${req.params.id} does not exist`)
    );
  }

  if (ticket.owner.toString() !== req.user.id && req.user.role !== "manager") {
    return next(new ApiError(`You are not the owner of this ticket`));
  }

  next();
});
