const request = require("supertest");
const app = require("../src/app");
const { Customer } = require("../src/models");

describe("Customer Endpoints", () => {
  describe("POST /customers", () => {
    it("should create a new customer with valid data", async () => {
      const customerData = {
        name: "Jane Smith",
        phone: "555-1234"
      };

      const response = await request(app)
        .post("/customers")
        .send(customerData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(customerData.name);
      expect(response.body.phone).toBe(customerData.phone);
    });

    it("should return 400 when name is missing", async () => {
      const customerData = {
        phone: "555-1234"
      };

      const response = await request(app)
        .post("/customers")
        .send(customerData)
        .expect(400);

      expect(response.body.message).toBe("Name and phone are required");
    });

    it("should return 400 when phone is missing", async () => {
      const customerData = {
        name: "Jane Smith"
      };

      const response = await request(app)
        .post("/customers")
        .send(customerData)
        .expect(400);

      expect(response.body.message).toBe("Name and phone are required");
    });

    it("should return 409 when creating customer with duplicate phone number", async () => {
      const customerData = {
        name: "Jane Smith",
        phone: "555-1234"
      };

      // Create first customer
      await request(app).post("/customers").send(customerData);

      // Try to create duplicate
      const response = await request(app)
        .post("/customers")
        .send({
          name: "Different Name",
          phone: "555-1234" // Same phone
        })
        .expect(409);

      expect(response.body.message).toBe("Customer with this phone number already exists");
    });
  });

  describe("GET /customers/:id", () => {
    it("should get customer by ID", async () => {
      // Create a customer first
      const customer = await Customer.create({
        name: "John Doe",
        phone: "555-5678"
      });

      const response = await request(app)
        .get(`/customers/${customer.id}`)
        .expect(200);

      expect(response.body.id).toBe(customer.id);
      expect(response.body.name).toBe("John Doe");
      expect(response.body.phone).toBe("555-5678");
    });

    it("should return 404 when customer not found", async () => {
      const response = await request(app)
        .get("/customers/99999")
        .expect(404);

      expect(response.body.message).toBe("Customer not found");
    });
  });

  describe("GET /customers", () => {
    it("should get all customers", async () => {
      // Create multiple customers
      await Customer.create({ name: "Customer 1", phone: "555-0001" });
      await Customer.create({ name: "Customer 2", phone: "555-0002" });
      await Customer.create({ name: "Customer 3", phone: "555-0003" });

      const response = await request(app)
        .get("/customers")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it("should return empty array when no customers exist", async () => {
      const response = await request(app)
        .get("/customers")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});
