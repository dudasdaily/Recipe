const NotificationService = require('./src/services/NotificationService');

async function testNotificationSystem() {
  console.log('🧪 알림 시스템 테스트 시작...\n');

  try {
    // 1. 테스트 알림 전송
    console.log('1️⃣ 테스트 알림 전송 중...');
    await NotificationService.sendTestNotification(1);
    console.log('✅ 테스트 알림 전송 완료\n');

    // 2. 유통기한 임박 알림 전송
    console.log('2️⃣ 유통기한 임박 알림 전송 중...');
    await NotificationService.sendImmediateExpiryNotification(1);
    console.log('✅ 유통기한 임박 알림 전송 완료\n');

    console.log('🎉 모든 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 스크립트 실행
testNotificationSystem(); 