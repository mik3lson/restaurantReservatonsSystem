const { Sequelize } = require("sequelize");

// Test database configuration using SQLite in-memory
const testSequelize = new Sequelize("sqlite::memory:", {
  logging: false,
  dialect: "sqlite"
});

module.exports = {
  sequelize: testSequelize,
  connectDB: jest.fn().mockResolvedValue(true)
};
