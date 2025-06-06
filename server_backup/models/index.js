// models/index.js
const { Sequelize, DataTypes } = require('sequelize');

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

// Ingredient 모델 정의
const Ingredient = sequelize.define('Ingredient', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'ingredients',
  timestamps: false
});

// 모델 export
module.exports = {
  sequelize,
  Ingredient
};
