const express = require("express");
const router = express.Router();

const {
  createTable,
  getTablesByRestaurant
} = require("../controllers/tableControllers");

// Add table to a restaurant
router.post("/restaurants/:restaurantId/tables", createTable);

// Get all tables for a restaurant
router.get("/restaurants/:restaurantId/tables", getTablesByRestaurant);

module.exports = router;
