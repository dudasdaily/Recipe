const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationSetting = sequelize.define('NotificationSetting', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'user_id'
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_enabled'
  }
}, {
  tableName: 'notification_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = NotificationSetting; 