const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // 로깅을 비활성화하려면 false로 설정
    timezone: '+09:00', // 한국 시간대 설정
  }
);

module.exports = sequelize; 