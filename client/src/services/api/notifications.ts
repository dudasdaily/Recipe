import { apiClient } from './client';
import {
  FCMTokenRequest,
  NotificationSettings,
  NotificationSettingsRequest,
  NotificationSettingsResponse,
  NotificationHistoryResponse,
  NotificationTokenResponse,
  TestNotificationRequest,
  TestNotificationResponse,
} from '../../types/api';

/**
 * FCM 토큰을 서버에 등록
 */
export const registerFCMToken = async (data: FCMTokenRequest): Promise<NotificationTokenResponse> => {
  return apiClient.post('/notifications/token', data);
};

/**
 * 알림 설정을 서버에 저장
 */
export const saveNotificationSettings = async (
  data: NotificationSettingsRequest
): Promise<NotificationSettingsResponse> => {
  return apiClient.post('/notifications/settings', data);
};

/**
 * 알림 설정을 서버에서 조회
 */
export const getNotificationSettings = async (): Promise<NotificationSettingsResponse> => {
  return apiClient.get('/notifications/settings');
};

/**
 * 테스트 알림 전송
 */
export const sendTestNotification = async (
  data: TestNotificationRequest
): Promise<TestNotificationResponse> => {
  return apiClient.post('/notifications/test', data);
};

/**
 * 알림 히스토리 조회
 */
export const getNotificationHistory = async (): Promise<NotificationHistoryResponse> => {
  return apiClient.get('/notifications/history');
}; 