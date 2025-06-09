const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
// const authMiddleware = require('../middleware/authMiddleware');

// 테스트를 위해 인증 미들웨어 주석 처리
// router.use(authMiddleware);

// FCM 토큰 등록
router.post('/token', NotificationController.registerToken);

// 알림 설정 관련 라우트
router.post('/settings', NotificationController.saveSettings);
router.get('/settings', NotificationController.getSettings);

// 알림 테스트
router.post('/test', NotificationController.sendTestNotification);

// 알림 히스토리
router.get('/history', NotificationController.getNotificationHistory);

module.exports = router; 