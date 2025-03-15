const { DataTypes } = require('sequelize');
const {sequelize} = require("../config/database")

const Quotes = sequelize.define('quotes', {
  quote_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  quote: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  char_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  word_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});


module.exports = Quotes