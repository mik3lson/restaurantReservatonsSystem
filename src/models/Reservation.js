const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Reservation = sequelize.define(
  "Reservation",
  {
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },

    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },

    partySize: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "reservations",
    timestamps: true,
    indexes: [
      {
        fields: ["tableId", "startTime", "endTime"]
      }
    ]
  }
);

module.exports = Reservation;
