const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 데이터베이스 연결
const { sequelize } = require('./models');

// 라우터 임포트
const ingredientRoutes = require('./routes/ingredientRoutes');
const visionRoutes = require('./routes/visionRoutes');
const ocrRoutes = require('./routes/ocrRoutes');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 라우트
app.use('/api/v1/ingredients', ingredientRoutes);
app.use('/api/v1/vision', visionRoutes);
app.use('/api/v1/ocr', ocrRoutes);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다.'
  });
});

// 데이터베이스 연결 및 서버 시작
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // 개발 환경에서만 force 옵션 사용
    const syncOptions = {
      // 개발 환경에서만 force: true 사용
      force: process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true',
      // 테이블이 없을 때만 생성
      alter: true
    };
    
    console.log('Database sync options:', syncOptions);
    await sequelize.sync(syncOptions);
    console.log('Database tables synchronized');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 