const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ingredient = sequelize.define('Ingredient', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expiry_date'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  memo: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ingredients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Ingredient; 