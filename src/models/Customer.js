const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Customer = sequelize.define(
  "Customer",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: "customers",
    timestamps: true
  }
);

module.exports = Customer;
