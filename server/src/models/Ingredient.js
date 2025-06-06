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
    default_expiry_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 7,
      comment: '기본 유통기한(일)'
    }
  }, {
    tableName: 'ingredients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    comment: '식재료 마스터 테이블'
  });

  return Ingredient;
}; 