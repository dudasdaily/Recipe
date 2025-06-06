// server/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 이미지 업로드 및 OCR 처리를 위한 라우터 (POST /api/ingredient/upload)
const ingredientRouter = require('./routes/ingredient');
// DB에서 재료를 추가하거나 조회하는 라우터 (GET, POST /api/ingredients)
const ingredientsRouter = require('./routes/ingredients');
// OpenAI 또는 Groq API를 통한 레시피 추천 라우터 (GET /api/recommend)
const recommendRouter = require('./routes/recommend');
// 테스트용 푸시 알림을 전송하는 라우터 (POST /api/test-notification)
const testNotificationRouter = require("./routes/testNotification");
// 클라이언트에서 보낸 FCM 토큰을 DB에 저장하는 라우터 (POST /api/fcm/register)
const fcmRouter = require("./routes/fcm");
// 유통기한 임박 재료에 대해 푸시 알림을 보내는 라우터 (GET /api/notify)
const notifyRouter = require('./routes/notify');



const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/ingredient', ingredientRouter);  // POST /api/ingredient/upload
app.use('/api/ingredients', ingredientsRouter); // GET, POST /api/ingredients
app.use('/api/recommend', recommendRouter); // GET /api/recommend
// 테스트용 푸시 알림 전송 API
app.use("/api/test-notification", testNotificationRouter); // POST /api/test-notification
// FCM 토큰 저장 API
app.use("/api/fcm", fcmRouter); // POST /api/fcm/register
// 유통기한 임박 재료 → 푸시 알림 발송 (수동 호출)
app.use('/api/notify', notifyRouter); //GET /api/notify


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
