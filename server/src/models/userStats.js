const { DataTypes } = require('sequelize');
const {sequelize} = require("../config/database")

const UserStats = sequelize.define('user_stats', {
  user_race_id: {
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
  test_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  words_id: { // should this be foreign keys?
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quote_id: { // this too
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  wpm: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mistakes: {
    type: DataTypes.ARRAY,
    allowNull: false,
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
    allowNull: false,
  },
});


module.exports = UserStats