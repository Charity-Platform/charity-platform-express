const express = require("express");
const router = express.Router();

const {
  createTicket,
  getTicketById,
  getAllTicketsForField,
  getAllTicketsForMentor,
  deleteTicket,
  getLoggedMentorTickets,
  consultaionPaymentSession,
  consultationCheckout,
  getConsultRequestById,
  getAllConsultRequests,
  deleteConsultRequestById,
  getLoggedMentorRequests,
} = require("../services/tickets.service");

const { allowedTo, protect } = require("../services/auth.service");
const { checkTicketOwner } = require("../middlewares/check.ticket.owner");

// Create ticket
router.post(
  "/",
  protect,
  allowedTo("mentor", "admin", "manager"),
  createTicket
);

// Get all tickets for field
router.get("/field", getAllTicketsForField);

// Get all tickets for mentor
router.get("/mentor/:mentor", getAllTicketsForMentor);

// Get all tickets for logged mentor
router.get("/my-tickets", protect, getLoggedMentorTickets);

router.post("/payment/:id", protect, consultaionPaymentSession);

router.post("/checkout/:data", protect, consultationCheckout);

router.get("/request/my-requests", protect, getLoggedMentorRequests);

router.get("/request", getAllConsultRequests);

router.delete("/request/:id", protect, deleteConsultRequestById);

router.get("/request/:id", protect, getConsultRequestById);

router.get("/request/:id", protect, deleteConsultRequestById);

// Get ticket by id
router.get("/:id", getTicketById);

// Delete ticket
router.delete(
  "/:id",
  protect,
  allowedTo("mentor", "manager"),
  checkTicketOwner,
  deleteTicket
);

module.exports = router;
