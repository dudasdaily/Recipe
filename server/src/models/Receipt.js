const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receipt = sequelize.define('Receipt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '영수증 고유 ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '사용자 ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    store_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '구매처'
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '구매일'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '총 구매금액'
    },
    receipt_image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '영수증 이미지 URL'
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
    tableName: 'receipts',
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: '영수증 테이블',
    indexes: [
      {
        name: 'idx_receipts_user_purchase',
        fields: ['user_id', 'purchase_date']
      }
    ]
  });

  return Receipt;
}; 