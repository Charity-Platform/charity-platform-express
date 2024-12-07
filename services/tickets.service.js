const asyncHandler = require("express-async-handler");
const factory = require("./handlers.factory");
const ConsultationTicket = require("../models/consultation.model");
const ApiError = require("../utils/api.error");
const ConsultationRequest = require("../models/consultaion.payment.record");
const { postPaymentData, getDecryptData } = require("../utils/helpers");
const Payments = require("../models/paymentRecords");
const Mentor = require("../models/mentor.model");

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

exports.consultaionPaymentSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Retrieve document based on ID from the Book model
  const document = await ConsultationTicket.findOne({ _id: id });

  // Check if the document exists, if not, send a 404 error
  if (!document) {
    return next(new ApiError(`The document for this id ${id} not found`, 404));
  }

  // Prepare payment data for postPaymentData function
  const data = {
    merchantCode: `${process.env.merchantCode}`,
    amount: document.price,
    paymentType: "0",
    responseUrl: `${process.env.responseUrl}/auth/payment/consultation`,
    failureUrl: `${process.env.failureUrl}/auth/payment/consultation`,
    version: "2",
    orderReferenceNumber: id,
    currency: "KWD",
    variable3: req.user.id + Date.now(),
    name: req.user.name,
    email: req.user.email,
    mobile_number: req.user.phone,
    saveCard: true,
  };

  // Call the postPaymentData function and send the response to the client
  const response = await postPaymentData(data);
  res.status(200).json({ status: "success", data: response });
});

exports.consultationCheckout = asyncHandler(async (req, res, next) => {
  const result = getDecryptData(req.params.data);
  if (result.status) {
    const payment = await Payments.findOne({
      refId: result.response.variable3,
    });
    // if (payment) {
    //   return next(new ApiError("expired payment token", 401));
    // }
    const paymentid = new Payments({
      refId: result.response.variable3,
    });
    await paymentid.save();

    const ticket = await ConsultationTicket.findByIdAndUpdate(
      result.response.orderReferenceNumber,
      { $set: { isActive: false } },
      { new: true }
    );
    //check the payment method
    let method;
    if (result.response.method === 0) {
      method = "Indirect";
    } else if (result.response.method === 1) {
      method = "Knet";
    } else if (result.response.method === 2) {
      method = "MPGS";
    }
    req.user.consultations.push(result.response.orderReferenceNumber);
    await req.user.save();

    const mentor = await Mentor.findById(ticket.owner);
    const { fees } = mentor;

    let amount = result.response.amount / 100;
    amount = amount - amount * (fees / 100);

    await Mentor.findByIdAndUpdate(
      ticket.owner,
      { $inc: { balance: amount } },
      { new: true }
    );
    const { response } = result;

    console.log(result);

    const consultRequest = new ConsultationRequest({
      user: req.user,
      ticket: response.orderReferenceNumber,
      mentor: mentor,
      amount: response.amount / 100,
      invoice_id: req.params.id,
      paymentMethod: method,
      type: response.type,
      paidOn: Date.now(),
    });
    await consultRequest.save();
    res.status(201).json({ Message: "course payment success" });
  } else {
    return next(new ApiError(`Payment failed`, 400));
  }
});
