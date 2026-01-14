const { createReservationService } = require("../services/reservation.services");

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

module.exports = { 
    createReservation, 
    getReservationsForRestaurant 
};
