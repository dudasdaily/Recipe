const NotificationService = require('../services/NotificationService');

class NotificationController {
  // 알림 설정 저장
  async saveSettings(req, res) {
    try {
      // 테스트를 위해 임시 사용자 ID 사용
      const userId = 1; // req.user.id 대신
      const settings = req.body;

      const notificationSetting = await NotificationService.updateNotificationSettings(
        userId,
        settings
      );

      res.json({
        success: true,
        data: notificationSetting
      });
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
      res.status(500).json({
        success: false,
        message: '알림 설정 저장에 실패했습니다.'
      });
    }
  }

  // 알림 설정 조회
  async getSettings(req, res) {
    try {
      // 테스트를 위해 임시 사용자 ID 사용
      const userId = 1; // req.user.id 대신
      const settings = await NotificationService.getNotificationSettings(userId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error getting notification settings:', error);
      res.status(500).json({
        success: false,
        error: '알림 설정 조회에 실패했습니다.'
      });
    }
  }

  // 테스트 알림 전송
  async sendTestNotification(req, res) {
    try {
      // 테스트를 위해 임시 사용자 ID 사용
      const userId = 1; // req.user.id 대신
      const { title, body } = req.body;

      await NotificationService.sendNotification(userId, {
        title: title || '테스트 알림',
        body: body || '이것은 테스트 알림입니다.',
        data: {
          type: 'TEST'
        }
      });

      res.json({
        success: true,
        message: '테스트 알림이 전송되었습니다.'
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        error: '테스트 알림 전송에 실패했습니다.'
      });
    }
  }

  // 알림 히스토리 조회
  async getNotificationHistory(req, res) {
    try {
      // 테스트를 위해 임시 사용자 ID 사용
      const userId = 1; // req.user.id 대신
      const history = await NotificationService.getNotificationHistory(userId);

      res.json({
        success: true,
        data: {
          notifications: history
        }
      });
    } catch (error) {
      console.error('Error getting notification history:', error);
      res.status(500).json({
        success: false,
        error: '알림 히스토리 조회에 실패했습니다.'
      });
    }
  }

  // FCM 토큰 등록
  async registerToken(req, res) {
    try {
      const { userId = 1, token, deviceInfo } = req.body; // 기본값 1 설정
      
      const fcmToken = await NotificationService.registerFCMToken(userId, token, deviceInfo);
      
      res.json({
        success: true,
        data: fcmToken
      });
    } catch (error) {
      console.error('Error registering FCM token:', error);
      res.status(500).json({
        success: false,
        error: 'FCM 토큰 등록에 실패했습니다.'
      });
    }
  }

  // 즉시 유통기한 알림 전송 (테스트용)
  async sendImmediateExpiryNotification(req, res) {
    try {
      // 테스트를 위해 임시 사용자 ID 사용
      const userId = req.body.userId || 1; // req.user.id 대신
      
      await NotificationService.sendImmediateExpiryNotification(userId);

      res.json({
        success: true,
        message: '즉시 유통기한 알림 전송이 완료되었습니다.'
      });
    } catch (error) {
      console.error('Error sending immediate expiry notification:', error);
      res.status(500).json({
        success: false,
        error: '즉시 유통기한 알림 전송에 실패했습니다.'
      });
    }
  }
}

module.exports = new NotificationController(); 