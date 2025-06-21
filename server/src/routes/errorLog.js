const express = require('express');
const router = express.Router();

// 로그 저장을 위한 간단한 메모리 저장소 (실제로는 데이터베이스에 저장해야 함)
// 에러 로그와 알림 로그를 모두 관리
let errorLogs = [];

/**
 * POST /error-log
 * 클라이언트에서 발생한 에러 로그를 받아서 저장
 */
router.post('/error-log', async (req, res) => {
  try {
    const {
      message,
      stack,
      context,
      timestamp,
      platform,
      version,
      userAgent
    } = req.body;

    // 에러 로그 객체 생성
    const errorLog = {
      id: Date.now(),
      message: message || 'Unknown error',
      stack: stack || '',
      context: context || 'unknown',
      timestamp: timestamp || new Date().toISOString(),
      platform: platform || 'unknown',
      version: version || '1.0.0',
      userAgent: userAgent || 'unknown',
      createdAt: new Date()
    };

    // 로그 저장 (최대 1000개 유지)
    errorLogs.push(errorLog);
    if (errorLogs.length > 1000) {
      errorLogs = errorLogs.slice(-1000);
    }

    // 콘솔에 에러 로그 출력
    console.error('🚨 CLIENT ERROR LOG:', {
      id: errorLog.id,
      message: errorLog.message,
      context: errorLog.context,
      timestamp: errorLog.timestamp,
      platform: errorLog.platform,
      version: errorLog.version
    });

    // 스택 트레이스가 있으면 별도로 출력
    if (errorLog.stack) {
      console.error('📋 STACK TRACE:', errorLog.stack);
    }

    res.status(200).json({
      success: true,
      message: 'Error log saved successfully',
      errorId: errorLog.id
    });

  } catch (error) {
    console.error('Error saving error log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save error log'
    });
  }
});

/**
 * GET /error-log
 * 저장된 에러 로그 조회 (관리자용)
 */
router.get('/error-log', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const limitedLogs = errorLogs
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .reverse(); // 최신 순으로 정렬

    res.status(200).json({
      success: true,
      data: {
        logs: limitedLogs,
        total: errorLogs.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error retrieving error logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve error logs'
    });
  }
});

/**
 * DELETE /error-log
 * 에러 로그 초기화 (관리자용)
 */
router.delete('/error-log', (req, res) => {
  try {
    const deletedCount = errorLogs.length;
    errorLogs = [];

    console.log(`🗑️ Cleared ${deletedCount} error logs`);

    res.status(200).json({
      success: true,
      message: `Cleared ${deletedCount} error logs`
    });

  } catch (error) {
    console.error('Error clearing error logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear error logs'
    });
  }
});

// 알림 로그 저장을 위한 간단한 메모리 저장소
let notificationLogs = [];

/**
 * POST /notification-log
 * 클라이언트에서 발생한 알림 로그를 받아서 저장
 */
router.post('/notification-log', async (req, res) => {
  try {
    const {
      type,
      title,
      body,
      scheduledTime,
      actualTime,
      ingredientId,
      ingredientName,
      expiryDate,
      deviceInfo,
      timestamp
    } = req.body;

    // 알림 로그 객체 생성
    const notificationLog = {
      id: Date.now(),
      type: type || 'UNKNOWN',
      title: title || 'Unknown notification',
      body: body || '',
      scheduledTime: scheduledTime || null,
      actualTime: actualTime || new Date().toISOString(),
      ingredientId: ingredientId || null,
      ingredientName: ingredientName || null,
      expiryDate: expiryDate || null,
      deviceInfo: deviceInfo || {},
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date()
    };

    // 로그 저장 (최대 1000개 유지)
    notificationLogs.push(notificationLog);
    if (notificationLogs.length > 1000) {
      notificationLogs = notificationLogs.slice(-1000);
    }

    // 콘솔에 알림 로그 출력
    console.log('📬 NOTIFICATION LOG:', {
      id: notificationLog.id,
      type: notificationLog.type,
      title: notificationLog.title,
      actualTime: notificationLog.actualTime,
      ingredientName: notificationLog.ingredientName
    });

    res.status(200).json({
      success: true,
      message: 'Notification log saved successfully',
      logId: notificationLog.id
    });

  } catch (error) {
    console.error('Error saving notification log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save notification log'
    });
  }
});

/**
 * GET /notification-log
 * 저장된 알림 로그 조회 (관리자용)
 */
router.get('/notification-log', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const limitedLogs = notificationLogs
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .reverse(); // 최신 순으로 정렬

    res.status(200).json({
      success: true,
      data: {
        logs: limitedLogs,
        total: notificationLogs.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error retrieving notification logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification logs'
    });
  }
});

/**
 * DELETE /notification-log
 * 알림 로그 초기화 (관리자용)
 */
router.delete('/notification-log', (req, res) => {
  try {
    const deletedCount = notificationLogs.length;
    notificationLogs = [];

    console.log(`🗑️ Cleared ${deletedCount} notification logs`);

    res.status(200).json({
      success: true,
      message: `Cleared ${deletedCount} notification logs`
    });

  } catch (error) {
    console.error('Error clearing notification logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notification logs'
    });
  }
});

module.exports = router; 