const Restaurant = require("../src/models/Restaurant");
const Table = require("../src/models/Table");
const Customer = require("../src/models/Customer");
const Reservation = require("../src/models/Reservation");

/**
 * Helper to create a test restaurant
 */
const createTestRestaurant = async (data = {}) => {
  return await Restaurant.create({
    name: data.name || "Test Restaurant",
    openTime: data.openTime || "09:00:00",
    closeTime: data.closeTime || "22:00:00"
  });
};

/**
 * Helper to create a test table
 */
const createTestTable = async (restaurantId, data = {}) => {
  return await Table.create({
    tableNumber: data.tableNumber || 1,
    capacity: data.capacity || 4,
    restaurantId
  });
};

/**
 * Helper to create a test customer
 */
const createTestCustomer = async (data = {}) => {
  return await Customer.create({
    name: data.name || "John Doe",
    phone: data.phone || `555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
  });
};

/**
 * Helper to create a test reservation
 */
const createTestReservation = async (data) => {
  return await Reservation.create({
    restaurantId: data.restaurantId,
    tableId: data.tableId,
    customerId: data.customerId,
    partySize: data.partySize || 2,
    startTime: data.startTime,
    endTime: data.endTime
  });
};

module.exports = {
  createTestRestaurant,
  createTestTable,
  createTestCustomer,
  createTestReservation
};
