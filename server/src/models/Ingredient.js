const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ingredient = sequelize.define('Ingredient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '식재료 고유 ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '식재료명'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '카테고리'
    },
    storage_type: {
      type: DataTypes.ENUM('ROOM_TEMP', 'REFRIGERATED', 'FROZEN'),
      defaultValue: 'ROOM_TEMP',
      comment: '보관 방법'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '수량'
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '유통기한'
    },
    default_expiry_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 7,
      comment: '기본 유통기한(일)'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '사용자 ID'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ingredients',
    timestamps: false,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: '식재료 마스터 테이블'
  });

  return Ingredient;
}; 