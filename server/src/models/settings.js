const { DataTypes } = require('sequelize');
const {sequelize} = require("../config/database")

const Settings = sequelize.define('settings', {
  settings_id: {
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

  cursorType: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  font: {
    type: DataTypes.STRING,
    allowNull: false, 
  },

  fontSize: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  theme: {
    type: DataTypes.STRING,
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


module.exports = Settings