const express = require("express");
const router = express.Router();
const {
  createReservation,
   getReservationsForRestaurant
}= require("../controllers/reservationControllers");

// Create a reservation
router.post("/", createReservation);

// Get reservations for a restaurant by date
router.get("/restaurant/:id", getReservationsForRestaurant);

module.exports = router;
