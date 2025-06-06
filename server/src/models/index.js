// models/index.js
const sequelize = require('../config/db');

// 모델 불러오기
const User = require('./User')(sequelize);
const Receipt = require('./Receipt')(sequelize);
const ReceiptItem = require('./ReceiptItem')(sequelize);
const Ingredient = require('./Ingredient')(sequelize);
const FCMToken = require('./FCMToken')(sequelize);

// 모델 간 관계 설정
User.hasMany(Ingredient);
Ingredient.belongsTo(User);

User.hasMany(Receipt);
Receipt.belongsTo(User);

Receipt.hasMany(ReceiptItem);
ReceiptItem.belongsTo(Receipt);

Ingredient.hasMany(ReceiptItem);
ReceiptItem.belongsTo(Ingredient);

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
