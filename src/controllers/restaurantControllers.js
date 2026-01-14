const { Op } = require("sequelize");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const Reservation = require("../models/Reservation");
const Customer = require("../models/Customer");

// Create a restaurant

const createRestaurant = async (req, res) => {
  try {
    const { name, openTime, closeTime } = req.body;

    if (!name || !openTime || !closeTime) {
      return res.status(400).json({
        message: "name, openTime, and closeTime are required"
      });
    }

    const restaurant = await Restaurant.create({
      name,
      openTime,
      closeTime
    });

    return res.status(201).json(restaurant);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

//Get all restaurants

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    return res.json(restaurants);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// Get restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: Table
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found"
      });
    }

    const numberOfTables = restaurant.Tables.length || 0;

    return res.json({
        ...restaurant.toJSON(),
    numberOfTables
  });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


const getRestaurantWithReservations = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; //optional date filter

    let reservationWhere = {};
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      reservationWhere = {
        startTime: { [Op.gte]: startOfDay, [Op.lte]: endOfDay }
      };
    }

    const restaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: Table,
          include: [
            {
              model: Reservation,
              where: reservationWhere,
              required: false,
              include: [Customer] // include customer info
            }
          ]
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
};

const getAvailableTables = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, partySize } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        message: "startTime and endTime are required"
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Get candidate tables
    const tables = await Table.findAll({
      where: {
        restaurantId: id,
        ...(partySize && {
          capacity: { [Op.gte]: Number(partySize) }
        })
      }
    });

    // Filtering out tables with conflicts
    const availableTables = [];

    for (const table of tables) {
      const conflict = await Reservation.findOne({
        where: {
          tableId: table.id,
          startTime: { [Op.lt]: end },
          endTime: { [Op.gt]: start }
        }
      });

      if (!conflict) {
        availableTables.push(table);
      }
    }

    return res.json({
      restaurantId: id,
      availableTablesCount: availableTables.length,
      availableTables
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};




module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getRestaurantWithReservations,
  getAvailableTables
};
