// Mock the db module before any imports
jest.mock("../src/db", () => require("./testDb"));

const { sequelize } = require("./testDb");

// Setup test database before all tests
beforeAll(async () => {
  // Import models after mocking db
  require("../src/models/index");
  
  // Force sync - recreate tables
  await sequelize.sync({ force: true });
});

// Clean up after each test
afterEach(async () => {
  // Clear all tables
  const models = sequelize.models;
  for (const modelName in models) {
    await models[modelName].destroy({ where: {}, truncate: true });
  }
});

// Close connection after all tests
afterAll(async () => {
  await sequelize.close();
});

module.exports = { sequelize };
