const admin = require("../config/fcm");

async function sendNotification(fcmToken, title, body) {
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ 알림 전송 성공:", response);
    return response;
  } catch (error) {
    console.error("❌ 알림 전송 실패:", error);
    throw error;
  }
}

module.exports = sendNotification;
