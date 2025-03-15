const { DataTypes } = require('sequelize');
const {sequelize} = require("../config/database")

const Races = sequelize.define('races', {
  race_id: {
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
  words_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'words',
      key: 'words_id',
    },
    onUpdate: 'CASCADE', // Optional: Specifies behavior on update
    onDelete: 'CASCADE', // Optional: Specifies behavior on delete
  },
  quote_id: {
    type: DataTypes.INTEGER,
    
    references: {
      model: 'quotes',
      key: 'quotes_id',
    },
    onUpdate: 'CASCADE', // Optional: Specifies behavior on update
    onDelete: 'CASCADE', // Optional: Specifies behavior on delete
  },
  wpm: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  accuracy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mistakes: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: false
  },
  won: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  ranked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  race_number: {
    type: DataTypes.INTEGER,
  },
  createdAt: {
    type: DataTypes.DATE,
    // defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    // defaultValue: DataTypes.NOW,
  },
});


module.exports = Races