// models/index.js
const { Sequelize } = require('sequelize');

// .env 파일에서 환경변수 불러오기
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // 데이터베이스 이름
  process.env.DB_USER,      // 사용자 이름
  process.env.DB_PASSWORD,  // 비밀번호
  {
    host: process.env.DB_HOST,   // 호스트 (예: localhost)
    dialect: 'mysql',            // 사용할 DB 종류
    logging: false               // 콘솔에 SQL 안 찍히게
  }
);

// 모델 불러오기
const User = require('./User')(sequelize);
const Receipt = require('./Receipt')(sequelize);
const ReceiptItem = require('./ReceiptItem')(sequelize);
const Ingredient = require('./Ingredient')(sequelize);
const FCMToken = require('./FCMToken')(sequelize);

// 관계 설정
User.hasMany(Receipt, {
  foreignKey: 'userId',
  as: 'receipts'
});

Receipt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Receipt.hasMany(ReceiptItem, {
  foreignKey: 'receiptId',
  as: 'items'
});

ReceiptItem.belongsTo(Receipt, {
  foreignKey: 'receiptId',
  as: 'receipt'
});

ReceiptItem.belongsTo(Ingredient, {
  foreignKey: 'ingredientId',
  as: 'ingredient'
});

Ingredient.hasMany(ReceiptItem, {
  foreignKey: 'ingredientId',
  as: 'receiptItems'
});

User.hasMany(FCMToken, {
  foreignKey: 'userId',
  as: 'fcmTokens'
});

FCMToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 모델 export
module.exports = {
  sequelize,
  User,
  Receipt,
  ReceiptItem,
  Ingredient,
  FCMToken
};
