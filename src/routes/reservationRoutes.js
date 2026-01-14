const express = require("express");
const router = express.Router();
const {
  createReservation,
   getReservationsForRestaurant,
   cancelReservation,
   updateReservation
}= require("../controllers/reservationControllers");

// Create a reservation
router.post("/", createReservation);

// Get reservations for a restaurant by date
router.get("/restaurant/:id", getReservationsForRestaurant);

// Cancel a reservation
router.delete("/:id", cancelReservation);

// Update a reservation
router.put("/:id", updateReservation);

module.exports = router;
