// models/index.js
const sequelize = require('../db');

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
  foreignKey: 'user_id',
  as: 'fcmTokens'
});

FCMToken.belongsTo(User, {
  foreignKey: 'user_id',
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
