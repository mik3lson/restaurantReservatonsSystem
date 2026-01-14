const { Restaurant, Table } = require("../models");

/**
 * Create a table for a restaurant
 * Prevents duplicate table numbers
 */
const createTableForRestaurant = async (restaurantId, tableNumber, capacity) => {
  // Ensure restaurant exists
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  // Prevent duplicate table number
  const existing = await Table.findOne({
    where: { tableNumber, restaurantId }
  });
  if (existing) throw new Error("Table number already exists for this restaurant");

  // Create table
  return Table.create({
    tableNumber,
    capacity,
    restaurantId
  });
};

module.exports = {
  createTableForRestaurant
};
