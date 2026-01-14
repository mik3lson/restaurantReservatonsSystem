const request = require("supertest");
const app = require("../src/app");
const Reservation = require("../src/models/Reservation");
const { createTestRestaurant, createTestTable, createTestCustomer, createTestReservation } = require("./helpers");

describe("Reservation Endpoints", () => {
  describe("POST /reservations", () => {
    it("should create a reservation with valid data", async () => {
      const restaurant = await createTestRestaurant({
        openTime: "09:00:00",
        closeTime: "22:00:00"
      });
      const table = await createTestTable(restaurant.id, { capacity: 4 });
      const customer = await createTestCustomer();

      const reservationData = {
        restaurantId: restaurant.id,
        customerId: customer.id,
        partySize: 2,
        startTime: "2026-01-15T12:00:00",
        endTime: "2026-01-15T14:00:00"
      };

      const response = await request(app)
        .post("/reservations")
        .send(reservationData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.restaurantId).toBe(restaurant.id);
      expect(response.body.customerId).toBe(customer.id);
      expect(response.body.partySize).toBe(2);
      expect(response.body.tableId).toBe(table.id);
    });

    it("should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/reservations")
        .send({
          partySize: 2,
          startTime: "2026-01-15T12:00:00"
        })
        .expect(400);

      expect(response.body.message).toBe("Missing required fields");
    });

    it("should return 400 when restaurant does not exist", async () => {
      const customer = await createTestCustomer();

      const reservationData = {
        restaurantId: 99999,
        customerId: customer.id,
        partySize: 2,
        startTime: "2026-01-15T12:00:00",
        endTime: "2026-01-15T14:00:00"
      };

      const response = await request(app)
        .post("/reservations")
        .send(reservationData)
        .expect(400);

      expect(response.body.message).toBe("Restaurant not found");
    });

    it("should return 400 when no table can accommodate party size", async () => {
      const restaurant = await createTestRestaurant();
      await createTestTable(restaurant.id, { capacity: 2 }); // Only 2-person table
      const customer = await createTestCustomer();

      const reservationData = {
        restaurantId: restaurant.id,
        customerId: customer.id,
        partySize: 6, // Too big for available tables
        startTime: "2026-01-15T12:00:00",
        endTime: "2026-01-15T14:00:00"
      };

      const response = await request(app)
        .post("/reservations")
        .send(reservationData)
        .expect(400);

      expect(response.body.message).toBe("No table can accommodate this party size");
    });

    it("should return 400 when all suitable tables are booked", async () => {
      const restaurant = await createTestRestaurant({
        openTime: "09:00:00",
        closeTime: "22:00:00"
      });
      const table = await createTestTable(restaurant.id, { capacity: 4 });
      const customer1 = await createTestCustomer({ phone: "555-0001" });
      const customer2 = await createTestCustomer({ phone: "555-0002" });

      // Book the table
      await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer1.id,
        partySize: 2,
        startTime: new Date("2026-01-15T12:00:00"),
        endTime: new Date("2026-01-15T14:00:00")
      });

      // Try to book during overlapping time
      const reservationData = {
        restaurantId: restaurant.id,
        customerId: customer2.id,
        partySize: 2,
        startTime: "2026-01-15T13:00:00",
        endTime: "2026-01-15T15:00:00"
      };

      const response = await request(app)
        .post("/reservations")
        .send(reservationData)
        .expect(400);

      expect(response.body.message).toBe("Restaurant fully booked for this time slot");
    });

    it("should successfully book when tables are available at different times", async () => {
      const restaurant = await createTestRestaurant({
        openTime: "09:00:00",
        closeTime: "22:00:00"
      });
      const table = await createTestTable(restaurant.id, { capacity: 4 });
      const customer1 = await createTestCustomer({ phone: "555-0001" });
      const customer2 = await createTestCustomer({ phone: "555-0002" });

      // First booking 12:00-14:00
      await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer1.id,
        partySize: 2,
        startTime: new Date("2026-01-15T12:00:00"),
        endTime: new Date("2026-01-15T14:00:00")
      });

      // Second booking 15:00-17:00 (no overlap)
      const reservationData = {
        restaurantId: restaurant.id,
        customerId: customer2.id,
        partySize: 2,
        startTime: "2026-01-15T15:00:00",
        endTime: "2026-01-15T17:00:00"
      };

      const response = await request(app)
        .post("/reservations")
        .send(reservationData)
        .expect(201);

      expect(response.body.tableId).toBe(table.id);
    });

    it("should select smallest suitable table", async () => {
      const restaurant = await createTestRestaurant({
        openTime: "09:00:00",
        closeTime: "22:00:00"
      });
      const smallTable = await createTestTable(restaurant.id, { tableNumber: 1, capacity: 2 });
      const mediumTable = await createTestTable(restaurant.id, { tableNumber: 2, capacity: 4 });
      const largeTable = await createTestTable(restaurant.id, { tableNumber: 3, capacity: 8 });
      const customer = await createTestCustomer();

      const reservationData = {
        restaurantId: restaurant.id,
        customerId: customer.id,
        partySize: 2,
        startTime: "2026-01-15T12:00:00",
        endTime: "2026-01-15T14:00:00"
      };

      const response = await request(app)
        .post("/reservations")
        .send(reservationData)
        .expect(201);

      // Should assign the smallest table (capacity 2)
      expect(response.body.tableId).toBe(smallTable.id);
    });
  });

  describe("GET /reservations/restaurant/:id", () => {
    it("should get reservations for a restaurant by date", async () => {
      const restaurant = await createTestRestaurant();
      const table = await createTestTable(restaurant.id);
      const customer = await createTestCustomer();

      const today = new Date("2026-01-15");
      today.setHours(12, 0, 0, 0);
      const endTime = new Date(today);
      endTime.setHours(14, 0, 0, 0);

      await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer.id,
        partySize: 2,
        startTime: today,
        endTime: endTime
      });

      const response = await request(app)
        .get(`/reservations/restaurant/${restaurant.id}?date=2026-01-15`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 400 when date is not provided", async () => {
      const restaurant = await createTestRestaurant();

      const response = await request(app)
        .get(`/reservations/restaurant/${restaurant.id}`)
        .expect(400);

      expect(response.body.message).toBe("Please provide a date in YYYY-MM-DD format");
    });
  });

  describe("DELETE /reservations/:id", () => {
    it("should cancel a reservation", async () => {
      const restaurant = await createTestRestaurant();
      const table = await createTestTable(restaurant.id);
      const customer = await createTestCustomer();

      const reservation = await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer.id,
        partySize: 2,
        startTime: new Date("2026-01-15T12:00:00"),
        endTime: new Date("2026-01-15T14:00:00")
      });

      const response = await request(app)
        .delete(`/reservations/${reservation.id}`)
        .expect(200);

      expect(response.body.message).toBe("Reservation cancelled successfully");

      // Verify deletion
      const deleted = await Reservation.findByPk(reservation.id);
      expect(deleted).toBeNull();
    });

    it("should return 404 when reservation does not exist", async () => {
      const response = await request(app)
        .delete("/reservations/99999")
        .expect(404);

      expect(response.body.message).toBe("Reservation not found");
    });
  });

  describe("PUT /reservations/:id", () => {
    it("should update a reservation with new time", async () => {
      const restaurant = await createTestRestaurant({
        openTime: "09:00:00",
        closeTime: "22:00:00"
      });
      const table = await createTestTable(restaurant.id, { capacity: 4 });
      const customer = await createTestCustomer();

      const reservation = await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer.id,
        partySize: 2,
        startTime: new Date("2026-01-15T12:00:00"),
        endTime: new Date("2026-01-15T14:00:00")
      });

      const updateData = {
        startTime: "2026-01-15T15:00:00",
        endTime: "2026-01-15T17:00:00"
      };

      const response = await request(app)
        .put(`/reservations/${reservation.id}`)
        .send(updateData)
        .expect(200);

      expect(new Date(response.body.startTime).toISOString()).toBe(new Date("2026-01-15T15:00:00").toISOString());
      expect(new Date(response.body.endTime).toISOString()).toBe(new Date("2026-01-15T17:00:00").toISOString());
    });

    it("should update party size and reassign table if needed", async () => {
      const restaurant = await createTestRestaurant({
        openTime: "09:00:00",
        closeTime: "22:00:00"
      });
      const smallTable = await createTestTable(restaurant.id, { tableNumber: 1, capacity: 2 });
      const largeTable = await createTestTable(restaurant.id, { tableNumber: 2, capacity: 6 });
      const customer = await createTestCustomer();

      const reservation = await createTestReservation({
        restaurantId: restaurant.id,
        tableId: smallTable.id,
        customerId: customer.id,
        partySize: 2,
        startTime: new Date("2026-01-15T12:00:00"),
        endTime: new Date("2026-01-15T14:00:00")
      });

      const updateData = {
        partySize: 5 // Requires larger table
      };

      const response = await request(app)
        .put(`/reservations/${reservation.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.partySize).toBe(5);
      expect(response.body.tableId).toBe(largeTable.id);
    });

    it("should return 404 when reservation does not exist", async () => {
      const updateData = {
        startTime: "2026-01-15T15:00:00"
      };

      const response = await request(app)
        .put("/reservations/99999")
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe("Reservation not found");
    });

    it("should return 400 when trying to update past reservation", async () => {
      const restaurant = await createTestRestaurant();
      const table = await createTestTable(restaurant.id);
      const customer = await createTestCustomer();

      // Create a past reservation
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      pastDate.setHours(12, 0, 0, 0);
      const pastEnd = new Date(pastDate);
      pastEnd.setHours(14, 0, 0, 0);

      const reservation = await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer.id,
        partySize: 2,
        startTime: pastDate,
        endTime: pastEnd
      });

      const updateData = {
        partySize: 4
      };

      const response = await request(app)
        .put(`/reservations/${reservation.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe("Cannot update a reservation that has already started");
    });

    it("should return 400 when no tables available for new time", async () => {
      const restaurant = await createTestRestaurant({
        openTime: "09:00:00",
        closeTime: "22:00:00"
      });
      const table = await createTestTable(restaurant.id, { capacity: 4 });
      const customer1 = await createTestCustomer({ phone: "555-0001" });
      const customer2 = await createTestCustomer({ phone: "555-0002" });

      // First reservation
      const reservation1 = await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer1.id,
        partySize: 2,
        startTime: new Date("2026-01-15T12:00:00"),
        endTime: new Date("2026-01-15T14:00:00")
      });

      // Second reservation at different time
      const reservation2 = await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer2.id,
        partySize: 2,
        startTime: new Date("2026-01-15T15:00:00"),
        endTime: new Date("2026-01-15T17:00:00")
      });

      // Try to update reservation2 to overlap with reservation1
      const updateData = {
        startTime: "2026-01-15T13:00:00",
        endTime: "2026-01-15T15:00:00"
      };

      const response = await request(app)
        .put(`/reservations/${reservation2.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe("No available tables for the selected time");
    });

    it("should allow updating to same table if available", async () => {
      const restaurant = await createTestRestaurant({
        openTime: "09:00:00",
        closeTime: "22:00:00"
      });
      const table = await createTestTable(restaurant.id, { capacity: 4 });
      const customer = await createTestCustomer();

      const reservation = await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer.id,
        partySize: 2,
        startTime: new Date("2026-01-15T12:00:00"),
        endTime: new Date("2026-01-15T14:00:00")
      });

      // Update only party size, keep same time
      const updateData = {
        partySize: 3
      };

      const response = await request(app)
        .put(`/reservations/${reservation.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.partySize).toBe(3);
      expect(response.body.tableId).toBe(table.id);
    });
  });
});
