const request = require("supertest");
const app = require("../src/app");
const { Restaurant, Table, Customer, Reservation } = require("../src/models");
const { createTestRestaurant, createTestTable, createTestCustomer, createTestReservation } = require("./helpers");

describe("Restaurant Endpoints", () => {
  describe("POST /restaurants", () => {
    it("should create a new restaurant with valid data", async () => {
      const restaurantData = {
        name: "Italian Bistro",
        openTime: "10:00:00",
        closeTime: "23:00:00"
      };

      const response = await request(app)
        .post("/restaurants")
        .send(restaurantData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(restaurantData.name);
      expect(response.body.openTime).toBe(restaurantData.openTime);
      expect(response.body.closeTime).toBe(restaurantData.closeTime);
    });

    it("should return 400 when name is missing", async () => {
      const restaurantData = {
        openTime: "10:00:00",
        closeTime: "23:00:00"
      };

      const response = await request(app)
        .post("/restaurants")
        .send(restaurantData)
        .expect(400);

      expect(response.body.message).toBe("name, openTime, and closeTime are required");
    });

    it("should return 400 when openTime is missing", async () => {
      const restaurantData = {
        name: "Test Restaurant",
        closeTime: "23:00:00"
      };

      const response = await request(app)
        .post("/restaurants")
        .send(restaurantData)
        .expect(400);

      expect(response.body.message).toBe("name, openTime, and closeTime are required");
    });

    it("should return 400 when closeTime is missing", async () => {
      const restaurantData = {
        name: "Test Restaurant",
        openTime: "10:00:00"
      };

      const response = await request(app)
        .post("/restaurants")
        .send(restaurantData)
        .expect(400);

      expect(response.body.message).toBe("name, openTime, and closeTime are required");
    });
  });

  describe("GET /restaurants", () => {
    it("should get all restaurants", async () => {
      await createTestRestaurant({ name: "Restaurant 1" });
      await createTestRestaurant({ name: "Restaurant 2" });
      await createTestRestaurant({ name: "Restaurant 3" });

      const response = await request(app)
        .get("/restaurants")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it("should return empty array when no restaurants exist", async () => {
      const response = await request(app)
        .get("/restaurants")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("GET /restaurants/:id", () => {
    it("should get restaurant by ID with table count", async () => {
      const restaurant = await createTestRestaurant();
      await createTestTable(restaurant.id, { tableNumber: 1, capacity: 2 });
      await createTestTable(restaurant.id, { tableNumber: 2, capacity: 4 });

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}`)
        .expect(200);

      expect(response.body.id).toBe(restaurant.id);
      expect(response.body.name).toBe(restaurant.name);
      expect(response.body.numberOfTables).toBe(2);
    });

    it("should return 404 when restaurant not found", async () => {
      const response = await request(app)
        .get("/restaurants/99999")
        .expect(404);

      expect(response.body.message).toBe("Restaurant not found");
    });

    it("should return numberOfTables as 0 when no tables exist", async () => {
      const restaurant = await createTestRestaurant();

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}`)
        .expect(200);

      expect(response.body.numberOfTables).toBe(0);
    });
  });

  describe("GET /restaurants/:id/reservations", () => {
    it("should get restaurant with reservations filtered by date", async () => {
      const restaurant = await createTestRestaurant();
      const table = await createTestTable(restaurant.id);
      const customer = await createTestCustomer();

      // Create reservation for today
      const today = new Date();
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

      // Create reservation for tomorrow (should not be included)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(14, 0, 0, 0);

      await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer.id,
        partySize: 2,
        startTime: tomorrow,
        endTime: tomorrowEnd
      });

      const dateStr = today.toISOString().split('T')[0];
      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/reservations?date=${dateStr}`)
        .expect(200);

      expect(response.body.id).toBe(restaurant.id);
      expect(response.body.Tables).toBeDefined();
      expect(response.body.Tables[0].Reservations.length).toBe(1);
    });

    it("should return all reservations when date is missing", async () => {
      const restaurant = await createTestRestaurant();
      const table = await createTestTable(restaurant.id);
      const customer = await createTestCustomer();
      
      await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table.id,
        customerId: customer.id,
        partySize: 2,
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
      });

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/reservations`)
        .expect(200);

      expect(response.body.id).toBe(restaurant.id);
      expect(response.body.Tables).toBeDefined();
    });

    it("should return 404 when restaurant not found", async () => {
      const response = await request(app)
        .get("/restaurants/99999/reservations?date=2026-01-15")
        .expect(404);

      expect(response.body.message).toBe("Restaurant not found");
    });
  });

  describe("GET /restaurants/:id/available-tables", () => {
    it("should get available tables for a time range", async () => {
      const restaurant = await createTestRestaurant();
      const table1 = await createTestTable(restaurant.id, { tableNumber: 1, capacity: 2 });
      const table2 = await createTestTable(restaurant.id, { tableNumber: 2, capacity: 4 });
      const customer = await createTestCustomer();

      // Book table1 from 12:00-14:00
      const booking = new Date("2026-01-15T12:00:00");
      const bookingEnd = new Date("2026-01-15T14:00:00");
      await createTestReservation({
        restaurantId: restaurant.id,
        tableId: table1.id,
        customerId: customer.id,
        partySize: 2,
        startTime: booking,
        endTime: bookingEnd
      });

      // Query for 13:00-15:00 (overlaps with table1 booking)
      const queryStart = new Date("2026-01-15T13:00:00").toISOString();
      const queryEnd = new Date("2026-01-15T15:00:00").toISOString();

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/available-tables?startTime=${queryStart}&endTime=${queryEnd}`)
        .expect(200);

      expect(response.body.restaurantId).toBe(restaurant.id.toString());
      expect(response.body.availableTablesCount).toBe(1);
      expect(response.body.availableTables[0].id).toBe(table2.id);
    });

    it("should filter tables by party size", async () => {
      const restaurant = await createTestRestaurant();
      await createTestTable(restaurant.id, { tableNumber: 1, capacity: 2 });
      await createTestTable(restaurant.id, { tableNumber: 2, capacity: 4 });
      await createTestTable(restaurant.id, { tableNumber: 3, capacity: 6 });

      const queryStart = new Date("2026-01-15T12:00:00").toISOString();
      const queryEnd = new Date("2026-01-15T14:00:00").toISOString();

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/available-tables?startTime=${queryStart}&endTime=${queryEnd}&partySize=5`)
        .expect(200);

      expect(response.body.availableTablesCount).toBe(1);
      expect(response.body.availableTables[0].capacity).toBe(6);
    });

    it("should return 400 when startTime is missing", async () => {
      const restaurant = await createTestRestaurant();
      const queryEnd = new Date("2026-01-15T14:00:00").toISOString();

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/available-tables?endTime=${queryEnd}`)
        .expect(400);

      expect(response.body.message).toBe("startTime and endTime are required");
    });

    it("should return 400 when endTime is missing", async () => {
      const restaurant = await createTestRestaurant();
      const queryStart = new Date("2026-01-15T12:00:00").toISOString();

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/available-tables?startTime=${queryStart}`)
        .expect(400);

      expect(response.body.message).toBe("startTime and endTime are required");
    });

    it("should return all tables when none are booked", async () => {
      const restaurant = await createTestRestaurant();
      await createTestTable(restaurant.id, { tableNumber: 1, capacity: 2 });
      await createTestTable(restaurant.id, { tableNumber: 2, capacity: 4 });

      const queryStart = new Date("2026-01-15T12:00:00").toISOString();
      const queryEnd = new Date("2026-01-15T14:00:00").toISOString();

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/available-tables?startTime=${queryStart}&endTime=${queryEnd}`)
        .expect(200);

      expect(response.body.availableTablesCount).toBe(2);
    });
  });
});
