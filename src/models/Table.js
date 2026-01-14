const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Table = sequelize.define(
  "Table",
  {
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "tables",
    timestamps: true
  }
);

module.exports = Table;
