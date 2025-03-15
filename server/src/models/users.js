const { DataTypes } = require('sequelize');
const {sequelize} = require("../config/database")

const Users = sequelize.define('users', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    default: false
  },
  rankRating: {
    type: DataTypes.INTEGER,
    allowNull: false
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


module.exports = Users