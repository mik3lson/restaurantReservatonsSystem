const Restaurant = require("./Restaurant");
const Table = require("./Table");
const Customer = require("./Customer");
const Reservation = require("./Reservation");

// Restaurant → Tables
Restaurant.hasMany(Table, { foreignKey: "restaurantId" });
Table.belongsTo(Restaurant, { foreignKey: "restaurantId" });

// Restaurant → Reservations
Restaurant.hasMany(Reservation, { foreignKey: "restaurantId" });
Reservation.belongsTo(Restaurant, { foreignKey: "restaurantId" });

// Table → Reservations
Table.hasMany(Reservation, { foreignKey: "tableId" });
Reservation.belongsTo(Table, { foreignKey: "tableId" });

// Customer → Reservations
Customer.hasMany(Reservation, { foreignKey: "customerId" });
Reservation.belongsTo(Customer, { foreignKey: "customerId" });

// Reservation → Customer
Reservation.belongsTo(Customer, { foreignKey: "customerId" });
Customer.hasMany(Reservation, { foreignKey: "customerId" });

module.exports = {
  Restaurant,
  Table,
  Customer
};
