const { createReservationService } = require("../services/reservation.services");
const { Op } = require("sequelize");
const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const Customer = require("../models/Customer");

/**
 * Helper function to get reservations by restaurant and date
 */
const getReservationsByRestaurantAndDate = async (restaurantId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await Reservation.findAll({
    where: {
      restaurantId,
      startTime: { [Op.gte]: startOfDay, [Op.lte]: endOfDay }
    },
    include: [
      { model: Table },
      { model: Customer }
    ]
  });
};

const createReservation = async (req, res) => {
  try {
    const { restaurantId, customerId, partySize, startTime, endTime } = req.body;

    if (!restaurantId || !customerId || !partySize || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const reservation = await createReservationService({
      restaurantId,
      customerId,
      partySize,
      startTime: new Date(startTime),
      endTime: new Date(endTime)
    });

    return res.status(201).json(reservation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};  

/**
 * GET /restaurants/:id/reservations?date=YYYY-MM-DD
 */
const getReservationsForRestaurant = async (req, res) => {
  try {
    const { id: restaurantId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Please provide a date in YYYY-MM-DD format" });
    }

    const reservations = await getReservationsByRestaurantAndDate(restaurantId, date);

    return res.json(reservations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch reservations" });
  }
};


// Cancel a reservation
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found"
      });
    }

    await reservation.destroy();

    return res.json({
      message: "Reservation cancelled successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// Update a reservation
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, partySize } = req.body;

    const reservation = await Reservation.findByPk(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Prevent updating past reservations
    if (new Date(reservation.startTime) < new Date()) {
      return res.status(400).json({
        message: "Cannot update a reservation that has already started"
      });
    }

    const newStart = startTime ? new Date(startTime) : reservation.startTime;
    const newEnd = endTime ? new Date(endTime) : reservation.endTime;
    const newPartySize = partySize || reservation.partySize;

    // Find suitable tables in the restaurant
    const tables = await Table.findAll({
      where: {
        restaurantId: reservation.restaurantId,
        capacity: { [Op.gte]: newPartySize }
      }
    });

    let availableTable = null;

    for (const table of tables) {
      const conflict = await Reservation.findOne({
        where: {
          tableId: table.id,
          id: { [Op.ne]: reservation.id },
          startTime: { [Op.lt]: newEnd },
          endTime: { [Op.gt]: newStart }
        }
      });

      if (!conflict) {
        availableTable = table;
        break;
      }
    }

    // Check if new time is available tables
    if (!availableTable) {
      return res.status(400).json({
        message: "No available tables for the selected time"
      });
    }

    // Update reservation
    reservation.startTime = newStart;
    reservation.endTime = newEnd;
    reservation.partySize = newPartySize;
    reservation.tableId = availableTable.id;

    await reservation.save();

    return res.json(reservation);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


module.exports = { 
    createReservation, 
    getReservationsForRestaurant,
    cancelReservation,
    updateReservation
};
