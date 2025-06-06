const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const ingredientRoutes = require('./routes/ingredientRoutes');

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/v1/ingredients', ingredientRoutes);

// 데이터베이스 연결 및 서버 시작
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // 개발 환경에서만 테이블 동기화
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('Database synchronized');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer(); 