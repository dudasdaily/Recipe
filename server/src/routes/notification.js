const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middleware/auth');

// 모든 알림 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 알림 설정 저장
router.post('/settings', NotificationController.saveSettings);

// 알림 설정 조회
router.get('/settings', NotificationController.getSettings);

// 테스트 알림 전송
router.post('/test', NotificationController.sendTestNotification);

// 알림 히스토리 조회
router.get('/history', NotificationController.getHistory);

// 테스트용 알림 전송 (인증 없이)
router.post('/test-public', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM 토큰이 필요합니다.'
      });
    }

    const notification = {
      title: '테스트 알림',
      body: '알림 테스트가 성공적으로 전송되었습니다!'
    };

    const { sendNotification } = require('../config/firebase');
    await sendNotification(token, notification);

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
});

module.exports = router; 