const db = require('../db');
const sendNotification = require('./sendNotification');

async function notifyExpiringIngredients(token) {
  try {
    // 1. 유통기한 3일 이하 재료 확인
    const [urgentRows] = await db.query(`
      SELECT name FROM ingredients
      WHERE DATEDIFF(expiry_date, CURDATE()) BETWEEN 0 AND 3
    `);

    if (urgentRows.length === 0) {
      console.log('📭 유통기한 임박 재료 없음');
      return;
    }

    const ingredientList = urgentRows.map(row => row.name).join(', ');
    const message = `⏰ 유통기한 임박: ${ingredientList}`;

    // 2. 한 명에게만 알림 전송
    await sendNotification(token, '냉장고 알림 🧊', message);
    console.log(`✅ 알림 전송됨 → ${token}`);
  } catch (error) {
    console.error(`❌ 알림 전송 오류 [${token}]:`, error.message);
  }
}

module.exports = notifyExpiringIngredients;
