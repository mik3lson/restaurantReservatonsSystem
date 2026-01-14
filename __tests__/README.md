# Reservation System Test Suite

This test suite provides comprehensive coverage for the restaurant reservation system API endpoints.

## Test Structure

```
__tests__/
├── setup.js              # Test database configuration and cleanup
├── helpers.js            # Helper functions for creating test data
├── customer.test.js      # Customer endpoint tests
├── restaurant.test.js    # Restaurant endpoint tests
├── table.test.js         # Table endpoint tests
└── reservation.test.js   # Reservation endpoint tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest customer.test.js

# Run tests with coverage
npm test
```

## Test Coverage

### Customer Endpoints
- ✅ Create customer with valid data
- ✅ Validation for missing required fields (name, phone)
- ✅ Prevention of duplicate phone numbers (409 conflict)
- ✅ Get customer by ID
- ✅ Handle non-existent customer (404)
- ✅ Get all customers
- ✅ Handle empty customer list

### Restaurant Endpoints
- ✅ Create restaurant with valid data
- ✅ Validation for missing required fields (name, openTime, closeTime)
- ✅ Get all restaurants
- ✅ Get restaurant by ID with table count
- ✅ Handle non-existent restaurant (404)
- ✅ Get restaurant with reservations filtered by date
- ✅ Get available tables for time range
- ✅ Filter available tables by party size
- ✅ Validate required query parameters

### Table Endpoints
- ✅ Create table for a restaurant
- ✅ Validation for missing required fields (tableNumber, capacity)
- ✅ Prevent creating table for non-existent restaurant
- ✅ Allow multiple tables with different numbers
- ✅ Allow same table number in different restaurants
- ✅ Get all tables for a restaurant
- ✅ Handle restaurant with no tables
- ✅ Isolate tables by restaurant

### Reservation Endpoints
- ✅ Create reservation with valid data
- ✅ Validation for missing required fields
- ✅ Handle non-existent restaurant
- ✅ Prevent booking when no table can accommodate party size
- ✅ Prevent booking when all tables are booked
- ✅ Allow booking at different non-overlapping times
- ✅ Select smallest suitable table for party size
- ✅ Get reservations for restaurant by date
- ✅ Cancel reservation
- ✅ Handle canceling non-existent reservation
- ✅ Update reservation time
- ✅ Update party size and reassign table
- ✅ Prevent updating past reservations
- ✅ Handle no available tables when updating
- ✅ Allow updates to same table if available

## Edge Cases Tested

### Time Overlap Detection
Tests verify that the system correctly detects and prevents double-booking by checking:
- Exact time overlaps
- Partial time overlaps (start during existing reservation)
- Encompassing time ranges (new reservation surrounds existing)

### Capacity Management
- Smallest suitable table selection
- Table reassignment when party size changes
- No-suitable-table handling for large parties

### Temporal Constraints
- Operating hours validation
- Past reservation update prevention
- Date filtering accuracy

### Concurrency Scenarios
- Multiple bookings at different times on same table
- Multiple tables available for same time slot
- Table availability checks excluding current reservation (for updates)

## Test Database

Tests use an in-memory SQLite database that is:
- Created fresh before all tests
- Cleared between each test
- Closed after all tests complete

This ensures test isolation and prevents interference between test cases.

## Helper Functions

The test suite includes helper functions for creating test data:

- `createTestRestaurant()` - Create a restaurant with default or custom values
- `createTestTable()` - Create a table for a restaurant
- `createTestCustomer()` - Create a customer with unique phone
- `createTestReservation()` - Create a reservation with all required relationships

## Notes

- All tests use Supertest for HTTP request testing
- Jest is configured with 10-second timeout for database operations
- Coverage reports exclude node_modules
- Setup file automatically handles database lifecycle
