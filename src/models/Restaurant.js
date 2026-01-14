const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Restaurant = sequelize.define(
  "Restaurant",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    openTime: {
      type: DataTypes.TIME,
      allowNull: false
    },

    closeTime: {
      type: DataTypes.TIME,
      allowNull: false
    }
  },
  {
    tableName: "restaurants",
    timestamps: true
  }
);

module.exports = Restaurant;
