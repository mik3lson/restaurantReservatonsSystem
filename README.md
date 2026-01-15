# Restaurant Reservation System

A comprehensive backend API for managing restaurant reservations, tables, and customers. Built with Node.js, Express, and MySQL using Sequelize ORM.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Application Architecture](#application-architecture)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

---

## Setup Instructions

### Prerequisites

- Node.js 22+
- Docker & Docker Compose (optional)
- MySQL 8.0+ (if not using Docker)

### Local Setup

1. **Clone github repo and install dependencies**
   ```bash
   git clone https://github.com/mik3lson/restaurantReservationsSystem.git
   cd restaurantReservationSystem
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_NAME=reservation_db
   DB_USER=root
   DB_PASSWORD=your_password
   PORT=3000
   NODE_ENV=development
   ```

3. **Create database**
   ```bash
   mysql -u root -p
   CREATE DATABASE reservation_db;
   ```

4. **Start the server**
   ```bash
   node server.js
   ```

   Server will be available at `http://localhost:3000`

### Docker Setup

1. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop containers**
   ```bash
   docker-compose down
   ```

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run in watch mode
npm run test:watch

# Run specific test file
npx jest customer.test.js
```

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Requests (REST API)                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  Express Server │
         │   (PORT 3000)   │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐  ┌─────▼──────┐  ┌───▼────┐
│Routes │  │ Controllers│  │Services│
└───┬───┘  └─────┬──────┘  └───┬────┘
    │            │             │
    │     ┌──────▼──────┐      │
    │     │   Sequelize │◄─────┤
    │     │     ORM     │      │
    │     └──────┬──────┘      │
    │            │             │
    │     ┌──────▼──────┐      │
    │     │   Models    │      │
    │     │ (Entities)  │      │
    │     └──────┬──────┘      │
    │            │             │
    └────────────┼─────────────┘
                 │
         ┌───────▼────────┐
         │  MySQL Database│
         │                │
         │  - Customers   │
         │  - Restaurants │
         │  - Tables      │
         │  - Reservations│
         └────────────────┘
```

### Directory Structure

```
reservationSystem/
├── src/
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   ├── db.js                     # Database configuration
│   ├── controllers/              # Request handlers
│   │   ├── customerController.js
│   │   ├── restaurantControllers.js
│   │   ├── tableControllers.js
│   │   └── reservationControllers.js
│   ├── routes/                   # API routes
│   │   ├── customerRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── tableRoutes.js
│   │   └── reservationRoutes.js
│   ├── models/                   # Database models
│   │   ├── Customer.js
│   │   ├── Restaurant.js
│   │   ├── Table.js
│   │   ├── Reservation.js
│   │   └── index.js
│   └── services/                 # Business logic
│       ├── reservation.services.js
│       └── tableServices.js
├── __tests__/                    # Test suite (52 tests, 93% coverage)
├── Dockerfile                    # Container configuration
├── docker-compose.yml            # Multi-container setup
├── package.json
└── README.md
```

---

## API Documentation

### Base URL
```
http://localhost:3000
```

### Response Format
All responses are JSON with standardized structure:
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "555-1234",
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

---

## Customer Endpoints

### Create Customer
**POST** `/customers`

Creates a new customer record.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "555-9876"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "phone": "555-9876",
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Name and phone are required"
}
```

**Error (409 Conflict):**
```json
{
  "message": "Customer with this phone number already exists"
}
```

### Get All Customers
**GET** `/customers`

Retrieves all customers.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Jane Smith",
    "phone": "555-9876",
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:30:00Z"
  }
]
```

### Get Customer by ID
**GET** `/customers/:id`

Retrieves a specific customer.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "phone": "555-9876",
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

**Error (404 Not Found):**
```json
{
  "message": "Customer not found"
}
```

---

## Restaurant Endpoints

### Create Restaurant
**POST** `/restaurants`

Creates a new restaurant.

**Request Body:**
```json
{
  "name": "Italian Bistro",
  "openTime": "10:00:00",
  "closeTime": "23:00:00"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Italian Bistro",
  "openTime": "10:00:00",
  "closeTime": "23:00:00",
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

### Get All Restaurants
**GET** `/restaurants`

Retrieves all restaurants.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Italian Bistro",
    "openTime": "10:00:00",
    "closeTime": "23:00:00",
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:30:00Z"
  }
]
```

### Get Restaurant by ID
**GET** `/restaurants/:id`

Retrieves a specific restaurant with table count.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Italian Bistro",
  "openTime": "10:00:00",
  "closeTime": "23:00:00",
  "numberOfTables": 5,
  "Tables": [],
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

### Get Restaurant with Reservations
**GET** `/restaurants/:id/reservations?date=YYYY-MM-DD`

Retrieves all reservations for a restaurant on a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Italian Bistro",
  "Tables": [
    {
      "id": 1,
      "tableNumber": 1,
      "capacity": 4,
      "Reservations": [
        {
          "id": 1,
          "startTime": "2026-01-15T12:00:00Z",
          "endTime": "2026-01-15T14:00:00Z",
          "partySize": 2,
          "Customer": {
            "id": 1,
            "name": "Jane Smith",
            "phone": "555-9876"
          }
        }
      ]
    }
  ]
}
```

### Get Available Tables
**GET** `/restaurants/:id/available-tables?startTime=ISO8601&endTime=ISO8601&partySize=NUMBER`

Retrieves available tables for a time range, optionally filtered by party size.

**Query Parameters:**
- `startTime` (required): Start time in ISO 8601 format
- `endTime` (required): End time in ISO 8601 format
- `partySize` (optional): Minimum party size

**Response (200 OK):**
```json
{
  "restaurantId": "1",
  "availableTablesCount": 2,
  "availableTables": [
    {
      "id": 2,
      "tableNumber": 2,
      "capacity": 4,
      "restaurantId": 1,
      "createdAt": "2026-01-14T10:30:00Z",
      "updatedAt": "2026-01-14T10:30:00Z"
    }
  ]
}
```

---

## Table Endpoints

### Create Table
**POST** `/restaurants/:restaurantId/tables`

Adds a new table to a restaurant.

**Request Body:**
```json
{
  "tableNumber": 1,
  "capacity": 4
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "tableNumber": 1,
  "capacity": 4,
  "restaurantId": 1,
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

### Get Restaurant Tables
**GET** `/restaurants/:restaurantId/tables`

Retrieves all tables for a specific restaurant.

**Response (200 OK):**
```json
{
  "restaurantId": 1,
  "tables": [
    {
      "id": 1,
      "tableNumber": 1,
      "capacity": 4,
      "restaurantId": 1,
      "createdAt": "2026-01-14T10:30:00Z",
      "updatedAt": "2026-01-14T10:30:00Z"
    }
  ]
}
```

---

## Reservation Endpoints

### Create Reservation
**POST** `/reservations`

Creates a new reservation with automatic table assignment.

**Request Body:**
```json
{
  "restaurantId": 1,
  "customerId": 1,
  "partySize": 4,
  "startTime": "2026-01-15T12:00:00",
  "endTime": "2026-01-15T14:00:00"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "restaurantId": 1,
  "tableId": 1,
  "customerId": 1,
  "partySize": 4,
  "startTime": "2026-01-15T12:00:00Z",
  "endTime": "2026-01-15T14:00:00Z",
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

**Error (400 Bad Request):**
```json
{
  "message": "No table can accommodate this party size"
}
```

**Error (400 Conflict):**
```json
{
  "message": "Restaurant fully booked for this time slot"
}
```

### Get Reservations for Restaurant
**GET** `/reservations/restaurant/:id?date=YYYY-MM-DD`

Retrieves reservations for a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "restaurantId": 1,
    "tableId": 1,
    "customerId": 1,
    "partySize": 4,
    "startTime": "2026-01-15T12:00:00Z",
    "endTime": "2026-01-15T14:00:00Z",
    "createdAt": "2026-01-14T10:30:00Z",
    "updatedAt": "2026-01-14T10:30:00Z"
  }
]
```

### Update Reservation
**PUT** `/reservations/:id`

Updates a reservation's time or party size. Automatically reassigns table if needed.

**Request Body:**
```json
{
  "startTime": "2026-01-15T15:00:00",
  "endTime": "2026-01-15T17:00:00",
  "partySize": 6
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "restaurantId": 1,
  "tableId": 2,
  "customerId": 1,
  "partySize": 6,
  "startTime": "2026-01-15T15:00:00Z",
  "endTime": "2026-01-15T17:00:00Z",
  "createdAt": "2026-01-14T10:30:00Z",
  "updatedAt": "2026-01-14T10:30:00Z"
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Cannot update a reservation that has already started"
}
```

**Error (400 Conflict):**
```json
{
  "message": "No available tables for the selected time"
}
```

### Cancel Reservation
**DELETE** `/reservations/:id`

Cancels and removes a reservation.

**Response (200 OK):**
```json
{
  "message": "Reservation cancelled successfully"
}
```

**Error (404 Not Found):**
```json
{
  "message": "Reservation not found"
}
```

---

## Design Decisions

### 1. **Automatic Table Assignment**
- When creating a reservation, the system automatically assigns the smallest suitable table
- This optimizes table utilization and prevents wasting large tables for small parties
- **Rationale**: Improves restaurant efficiency and customer experience

### 2. **Conflict Detection via Time Overlap Algorithm**
- Uses Sequelize queries with `Op.lt` (less than) and `Op.gt` (greater than) operators
- Checks: `startTime < newEnd && endTime > newStart`
- **Rationale**: Prevents double-booking with accurate mathematical overlap detection

### 3. **Operating Hours Validation**
- Reservations cannot be made outside restaurant operating hours
- Validates both start and end times against open/close times
- **Rationale**: Ensures business logic compliance

### 4. **Past Reservation Protection**
- Cannot update reservations that have already started
- **Rationale**: Prevents modification of historical data and operational confusion

### 5. **Unique Phone Numbers**
- Customers are identified by unique phone numbers
- Prevents duplicate customer records
- **Rationale**: Ensures data integrity and simplifies customer lookup

### 6. **REST API Design**
- Standard HTTP methods: POST (create), GET (read), PUT (update), DELETE (delete)
- Consistent error handling with appropriate status codes (400, 404, 409, 500)
- **Rationale**: RESTful principles for predictable API behavior

### 7. **ORM Usage (Sequelize)**
- Uses Sequelize for database abstraction and relationship management
- Relationships defined in model index file
- **Rationale**: Type safety, query building, and migration support

---

## Known Limitations and posible future Improvements

### 1. **Single Time Zone Support**
- System currently assumes UTC timezone, hence it currently relies on client-side timezone conversion else Multi-region restaurants may have issues with local time interpretation

### 2. **No Authentication/Authorization**
- For the simplicty of an interview demo, no user authentication or session magangement(using jwt) were aded.

### 3. **No Rate Limiting**
- API has no throttling mechanism

### 5. **No Pagination**
- `GET /customers` and `GET /restaurants` return all records
- Could cause performance issues with large datasets



---

## Development

### Running in Development Mode
```bash
npm run dev
```
Uses nodemon for automatic restart on file changes.

### Testing
```bash
npm test              # Run all tests with coverage
npm run test:watch    # Run tests in watch mode
```


### Database Migrations
Currently using `sequelize.sync({ alter: true })` in development.
For production, implement Sequelize CLI migrations:
```bash
npx sequelize-cli migration:generate --name add-new-field
npx sequelize-cli db:migrate
```

---

## Support

For issues or questions:
1. Check the test suite for usage examples
2. Review API documentation above
3. Check Docker logs: `docker-compose logs -f app`
4. Review MySQL logs: `docker-compose logs -f mysql`

---

**Last Updated**: January 14, 2026  
**Version**: 1.0.0  
**Test Coverage**: 93.19%  
**Tests**: 52/52 passing




