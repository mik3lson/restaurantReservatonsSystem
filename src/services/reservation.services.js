const { Op } = require("sequelize");
const Table = require("../models/Table");
const Reservation = require("../models/Reservation");
const Restaurant = require("../models/Restaurant");

const createReservationService = async ({
  restaurantId,
  customerId,
  partySize,
  startTime,
  endTime
}) => {
  // 1. Validate restaurant exists
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  // 2. Check operating hours
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();

  if (
    startHour < restaurant.openingTime ||
    endHour > restaurant.closingTime
  ) {
    throw new Error("Reservation outside operating hours");
  }

  // 3. Find tables that can fit party size
  const suitableTables = await Table.findAll({
    where: {
      restaurantId,
      capacity: { [Op.gte]: partySize }
    },
    order: [["capacity", "ASC"]] // smallest suitable table first
  });

  if (suitableTables.length === 0) {
    throw new Error("No table can accommodate this party size");
  }

  // 4. Find a free table
  for (const table of suitableTables) {
    const conflict = await Reservation.findOne({
      where: {
        tableId: table.id,
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime }
      }
    });

    if (!conflict) {
      // 5. Create reservation USING existing table
      return await Reservation.create({
        restaurantId,
        tableId: table.id,
        customerId,
        partySize,
        startTime,
        endTime
      });
    }
  }

  // 6. No free tables
  throw new Error("Restaurant fully booked for this time slot");
};



module.exports = {
  createReservationService
};
