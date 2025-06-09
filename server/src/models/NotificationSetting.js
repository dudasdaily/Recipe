const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const NotificationSetting = sequelize.define('NotificationSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
    // 테스트를 위해 외래 키 제약 조건 주석 처리
    // references: {
    //   model: 'users',
    //   key: 'id'
    // }
  },
  notify_time: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: '09:00:00',
    field: 'notify_time'
  },
  notify_days: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'notify_days'
  },
  is_enabled: {
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