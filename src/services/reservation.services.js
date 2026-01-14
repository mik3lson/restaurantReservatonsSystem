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

const getReservationsByRestaurantAndDate = async (restaurantId, date) => {
  // Convert the date string into start & end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const reservations = await Reservation.findAll({
    where: {
      restaurantId,
      startTime: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay
      }
    },
    include: [
      { model: Table, attributes: ["id", "tableNumber", "capacity"] },
      { model: Customer, attributes: ["id", "name", "phone"] }
    ],
    order: [["startTime", "ASC"]]
  });

  return reservations;
};

module.exports = {
  createReservationService,
  getReservationsByRestaurantAndDate
};
