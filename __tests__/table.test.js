const request = require("supertest");
const app = require("../src/app");
const { Restaurant, Table } = require("../src/models");
const { createTestRestaurant } = require("./helpers");

describe("Table Endpoints", () => {
  describe("POST /restaurants/:restaurantId/tables", () => {
    it("should create a new table with valid data", async () => {
      const restaurant = await createTestRestaurant();

      const tableData = {
        tableNumber: 1,
        capacity: 4
      };

      const response = await request(app)
        .post(`/restaurants/${restaurant.id}/tables`)
        .send(tableData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.tableNumber).toBe(tableData.tableNumber);
      expect(response.body.capacity).toBe(tableData.capacity);
      expect(response.body.restaurantId).toBe(restaurant.id.toString());
    });

    it("should return 400 when tableNumber is missing", async () => {
      const restaurant = await createTestRestaurant();

      const tableData = {
        capacity: 4
      };

      const response = await request(app)
        .post(`/restaurants/${restaurant.id}/tables`)
        .send(tableData)
        .expect(400);

      expect(response.body.message).toBe("tableNumber and capacity are required");
    });

    it("should return 400 when capacity is missing", async () => {
      const restaurant = await createTestRestaurant();

      const tableData = {
        tableNumber: 1
      };

      const response = await request(app)
        .post(`/restaurants/${restaurant.id}/tables`)
        .send(tableData)
        .expect(400);

      expect(response.body.message).toBe("tableNumber and capacity are required");
    });

    it("should return 404 when restaurant does not exist", async () => {
      const tableData = {
        tableNumber: 1,
        capacity: 4
      };

      const response = await request(app)
        .post("/restaurants/99999/tables")
        .send(tableData)
        .expect(404);

      expect(response.body.message).toBe("Restaurant not found");
    });

    it("should allow multiple tables with different table numbers", async () => {
      const restaurant = await createTestRestaurant();

      await request(app)
        .post(`/restaurants/${restaurant.id}/tables`)
        .send({ tableNumber: 1, capacity: 2 })
        .expect(201);

      await request(app)
        .post(`/restaurants/${restaurant.id}/tables`)
        .send({ tableNumber: 2, capacity: 4 })
        .expect(201);

      const tables = await Table.findAll({ where: { restaurantId: restaurant.id } });
      expect(tables.length).toBe(2);
    });

    it("should allow same table number in different restaurants", async () => {
      const restaurant1 = await createTestRestaurant({ name: "Restaurant 1" });
      const restaurant2 = await createTestRestaurant({ name: "Restaurant 2" });

      await request(app)
        .post(`/restaurants/${restaurant1.id}/tables`)
        .send({ tableNumber: 1, capacity: 4 })
        .expect(201);

      await request(app)
        .post(`/restaurants/${restaurant2.id}/tables`)
        .send({ tableNumber: 1, capacity: 4 })
        .expect(201);

      const allTables = await Table.findAll();
      expect(allTables.length).toBe(2);
    });
  });

  describe("GET /restaurants/:restaurantId/tables", () => {
    it("should get all tables for a restaurant", async () => {
      const restaurant = await createTestRestaurant();

      await Table.create({ tableNumber: 1, capacity: 2, restaurantId: restaurant.id });
      await Table.create({ tableNumber: 2, capacity: 4, restaurantId: restaurant.id });
      await Table.create({ tableNumber: 3, capacity: 6, restaurantId: restaurant.id });

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/tables`)
        .expect(200);

      expect(response.body.restaurantId).toBe(restaurant.id);
      expect(response.body.tables).toBeDefined();
      expect(response.body.tables.length).toBe(3);
    });

    it("should return empty tables array when restaurant has no tables", async () => {
      const restaurant = await createTestRestaurant();

      const response = await request(app)
        .get(`/restaurants/${restaurant.id}/tables`)
        .expect(200);

      expect(response.body.restaurantId).toBe(restaurant.id);
      expect(response.body.tables).toBeDefined();
      expect(response.body.tables.length).toBe(0);
    });

    it("should return 404 when restaurant does not exist", async () => {
      const response = await request(app)
        .get("/restaurants/99999/tables")
        .expect(404);

      expect(response.body.message).toBe("Restaurant not found");
    });

    it("should only return tables for the specified restaurant", async () => {
      const restaurant1 = await createTestRestaurant({ name: "Restaurant 1" });
      const restaurant2 = await createTestRestaurant({ name: "Restaurant 2" });

      await Table.create({ tableNumber: 1, capacity: 2, restaurantId: restaurant1.id });
      await Table.create({ tableNumber: 2, capacity: 4, restaurantId: restaurant1.id });
      await Table.create({ tableNumber: 1, capacity: 6, restaurantId: restaurant2.id });

      const response = await request(app)
        .get(`/restaurants/${restaurant1.id}/tables`)
        .expect(200);

      expect(response.body.tables.length).toBe(2);
      expect(response.body.tables.every(t => t.restaurantId === restaurant1.id)).toBe(true);
    });
  });
});
