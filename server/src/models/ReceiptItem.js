const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReceiptItem = sequelize.define('ReceiptItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '영수증 항목 고유 ID'
    },
    receipt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '영수증 ID',
      references: {
        model: 'receipts',
        key: 'id'
      }
    },
    ingredient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '식재료 ID',
      references: {
        model: 'ingredients',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '수량'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '가격'
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '유통기한'
    },
    storage_location: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '보관 위치'
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '메모'
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
    tableName: 'receipt_items',
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: '영수증 항목 테이블',
    indexes: [
      {
        name: 'idx_receipt_items_receipt',
        fields: ['receipt_id']
      },
      {
        name: 'idx_receipt_items_ingredient',
        fields: ['ingredient_id']
      },
      {
        name: 'idx_receipt_items_expiry',
        fields: ['expiry_date']
      }
    ]
  });

  return ReceiptItem;
}; 