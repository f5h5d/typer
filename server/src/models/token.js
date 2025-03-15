const { DataTypes } = require('sequelize');
const {sequelize} = require("../config/database")

const Token = sequelize.define('token', {
  token_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
    onUpdate: 'CASCADE', // Optional: Specifies behavior on update
    onDelete: 'CASCADE', // Optional: Specifies behavior on delete
  },

  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    expires: 3600 // 1 hour
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

  
});


module.exports = Token