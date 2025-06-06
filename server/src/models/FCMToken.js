const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FCMToken = sequelize.define('FCMToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'FCM 토큰 고유 ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: '사용자 ID (외래키)'
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Firebase Cloud Messaging 토큰'
    },
    device_info: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '디바이스 정보 (운영체제, 버전 등)'
    },
    notify_time: {
      type: DataTypes.TIME,
      defaultValue: '09:00:00',
      comment: '알림 발송 시간'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '토큰 활성화 상태'
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '마지막 사용 시간'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '생성 시간'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '수정 시간'
    }
  }, {
    tableName: 'fcm_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_fcm_tokens_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_fcm_tokens_notify_time',
        fields: ['notify_time']
      }
    ]
  });

  // 관계 설정
  FCMToken.associate = (models) => {
    FCMToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return FCMToken;
}; 