// server/app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const ingredientRouter = require('./routes/ingredient'); //이미지 업로드 API
const ingredientsRouter = require('./routes/ingredients'); // DB table 연결 API
const recommendRouter = require('./routes/recommend'); // OpenAI API

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우터 설정
app.use('/api/ingredient', ingredientRouter);  // POST /api/ingredient/upload
app.use('/api/ingredients', ingredientsRouter); // GET, POST /api/ingredients
app.use('/api/recommend', recommendRouter); // GET /api/recommend

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

module.exports = app;
