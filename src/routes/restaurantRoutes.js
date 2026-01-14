const express = require("express");
const router = express.Router();

const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getRestaurantWithReservations,
  getAvailableTables
} = require("../controllers/restaurantControllers");

// Create restaurant
router.post("/", createRestaurant);

// Get all restaurants
router.get("/", getAllRestaurants);

// Get restaurant by ID
router.get("/:id", getRestaurantById);

//endpoint to retrieve the reservations for a restaurant, filtering by date
router.get("/:id/reservations", getRestaurantWithReservations);

// Endpoint to get available tables for a restaurant within a specified time range
router.get("/:id/available-tables", getAvailableTables);

module.exports = router;
