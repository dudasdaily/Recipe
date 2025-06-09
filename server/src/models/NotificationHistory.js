const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const NotificationHistory = sequelize.define('NotificationHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notification_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'notification_type'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'sent_at'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  }
}, {
  tableName: 'notification_history',
  timestamps: false
});

module.exports = NotificationHistory; 