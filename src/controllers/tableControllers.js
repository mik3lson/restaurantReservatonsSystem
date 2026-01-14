const { Restaurant, Table } = require("../models");

// Create a table for a restaurant
const createTable = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { tableNumber, capacity } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({
        message: "tableNumber and capacity are required"
      });
    }

    // Ensure restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      restaurantId
    });

    return res.status(201).json(table);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// Get tables for a restaurant
const getTablesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findByPk(restaurantId, {
      include: [Table]
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    return res.json({
      restaurantId: restaurant.id,
      tables: restaurant.Tables
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createTable,
  getTablesByRestaurant
};
