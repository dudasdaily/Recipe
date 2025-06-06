const cron = require('node-cron');
const dayjs = require('dayjs');
const db = require('../db');
const notifyExpiringIngredients = require('../services/expiryNotifier');

// 매 분마다 실행
cron.schedule('* * * * *', async () => {
  const now = dayjs().format('HH:mm');
  console.log(`🕒 현재 시간: ${now}`);

  // 1. 지금 시간이 설정된 사용자만 가져오기
  const [users] = await db.query(`
    SELECT token FROM fcm_tokens WHERE notify_time = ?
  `, [now]);

  if (users.length === 0) {
    console.log('😴 지금 알림 받을 유저 없음');
    return;
  }

  // 2. 각 사용자에게 개별 알림 보내기
  for (const { token } of users) {
    await notifyExpiringIngredients(token);
  }
});
