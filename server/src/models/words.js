const { DataTypes } = require('sequelize');
const {sequelize} = require("../config/database")

const Words = sequelize.define('words', {
  words_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  words: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  level: {
    type: DataTypes.INTEGER,
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


module.exports = Words