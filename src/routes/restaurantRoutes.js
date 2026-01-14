const express = require("express");
const router = express.Router();

const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getRestaurantWithReservations
} = require("../controllers/restaurantControllers");

// Create restaurant
router.post("/", createRestaurant);

// Get all restaurants
router.get("/", getAllRestaurants);

// Get restaurant by ID
router.get("/:id", getRestaurantById);

router.get("/:id/reservations", getRestaurantWithReservations);

module.exports = router;
