const NotificationService = require('../services/NotificationService');

class NotificationController {
  // 알림 설정 저장
  async saveSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = req.body;

      const notificationSetting = await NotificationService.saveNotificationSettings(
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
      const userId = req.user.id;
      const settings = await NotificationService.getNotificationSettings(userId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('알림 설정 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '알림 설정 조회에 실패했습니다.'
      });
    }
  }

  // 테스트 알림 전송
  async sendTestNotification(req, res) {
    try {
      const userId = req.user.id;
      await NotificationService.sendTestNotification(userId);

      res.json({
        success: true,
        message: '테스트 알림이 전송되었습니다.'
      });
    } catch (error) {
      console.error('테스트 알림 전송 실패:', error);
      res.status(500).json({
        success: false,
        message: error.message || '테스트 알림 전송에 실패했습니다.'
      });
    }
  }

  // 알림 히스토리 조회
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await NotificationService.getNotificationHistory(userId);

      res.json({
        success: true,
        data: {
          notifications: history
        }
      });
    } catch (error) {
      console.error('알림 히스토리 조회 실패:', error);
      res.status(500).json({
        success: false,
        message: '알림 히스토리 조회에 실패했습니다.'
      });
    }
  }
}

module.exports = new NotificationController(); 