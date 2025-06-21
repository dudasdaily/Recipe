import { apiClient } from './client';

export interface NotificationLogData {
  type: 'LOCAL_NOTIFICATION' | 'EXPIRY_ALERT' | 'TEST_NOTIFICATION';
  title: string;
  body: string;
  scheduledTime?: string;
  actualTime: string;
  ingredientId?: number;
  ingredientName?: string;
  expiryDate?: string;
  deviceInfo?: {
    platform: string;
    timezone: string;
  };
}

/**
 * 알림 도착 로그를 서버에 전송
 */
export const logNotificationReceived = async (logData: NotificationLogData): Promise<void> => {
  try {
    console.log('📝 알림 로그 전송:', logData);
    
    await apiClient.post('/notification-log', {
      ...logData,
      timestamp: new Date().toISOString(),
    });
    
    console.log('✅ 알림 로그 전송 성공');
  } catch (error) {
    console.error('❌ 알림 로그 전송 실패:', error);
    // 로그 전송 실패는 앱 동작을 방해하지 않도록 에러를 throw하지 않습니다
  }
};

/**
 * 즉시 테스트 알림 로그
 */
export const logTestNotification = async (type: 'IMMEDIATE' | 'DELAYED'): Promise<void> => {
  const logData: NotificationLogData = {
    type: 'TEST_NOTIFICATION',
    title: type === 'IMMEDIATE' ? '즉시 테스트 알림' : '1분 후 테스트 알림',
    body: type === 'IMMEDIATE' ? '로컬 알림이 정상 작동합니다!' : '1분 후 테스트 알림이 도착했습니다!',
    actualTime: new Date().toISOString(),
    deviceInfo: {
      platform: 'expo',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  await logNotificationReceived(logData);
};

/**
 * 재료 만료 알림 로그
 */
export const logExpiryNotification = async (
  ingredientId: number,
  ingredientName: string,
  expiryDate: string,
  scheduledTime?: string
): Promise<void> => {
  const logData: NotificationLogData = {
    type: 'EXPIRY_ALERT',
    title: '재료 유통기한 알림',
    body: `${ingredientName}의 유통기한이 임박했습니다.`,
    scheduledTime,
    actualTime: new Date().toISOString(),
    ingredientId,
    ingredientName,
    expiryDate,
    deviceInfo: {
      platform: 'expo',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  await logNotificationReceived(logData);
}; 