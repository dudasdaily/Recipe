import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { getNotificationHistory } from '../services/api/notifications';
import { useNotificationStore } from '../stores/notification';

// 전역 플래그로 중복 초기화 방지
let isInitialized = false;
let globalNotificationListener: Notifications.Subscription | null = null;
let globalResponseListener: Notifications.Subscription | null = null;

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * 푸시 알림 수신 처리를 위한 커스텀 훅
 */
export const usePushNotifications = () => {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { addNotificationToHistory } = useNotificationStore();

  useEffect(() => {
    // 이미 초기화되었으면 중복 초기화 방지
    if (isInitialized) {
      console.log('🚫 usePushNotifications: 이미 초기화됨, 중복 초기화 방지');
      return;
    }

    // Expo Go에서는 제한이 있으므로 개발 모드에서는 로컬 알림만 처리
    if (__DEV__) {
      console.log('개발 모드: 로컬 알림만 처리합니다.');
    }

    console.log('✅ usePushNotifications: 초기화 시작');

    // 기존 리스너가 있으면 정리
    if (globalNotificationListener) {
      globalNotificationListener.remove();
      globalNotificationListener = null;
    }
    if (globalResponseListener) {
      globalResponseListener.remove();
      globalResponseListener = null;
    }

    // 포그라운드 알림 리스너
    globalNotificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 포그라운드 알림 수신:', notification.request.content.title);
      
      // 알림을 히스토리에 저장
      const { title, body, data } = notification.request.content;
      
      // 수동 알림(EXPIRY_ALERT)은 이미 히스토리에 저장되었으므로 중복 저장 방지
      if (data?.type === 'EXPIRY_ALERT') {
        console.log('🚫 수동 알림 감지, 히스토리 저장 건너뜀:', title, body, data.type);
        return;
      }
      
      addNotificationToHistory({
        type: data?.type || 'LOCAL_NOTIFICATION',
        title: title || '알림',
        body: body || '',
        sentAt: new Date().toISOString(),
        readAt: null,
      });
    });

    // 알림 탭 리스너
    globalResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 알림 탭됨:', response.notification.request.content.title);
      
      const { data } = response.notification.request.content;
      
      // 알림 타입에 따른 화면 이동
      if (data?.type === 'EXPIRY_ALERT') {
        // 유통기한 알림인 경우 재료 목록 화면으로 이동
        router.push('/(tabs)');
      } else if (data?.type === 'TEST_NOTIFICATION') {
        // 테스트 알림인 경우 설정 화면으로 이동
        router.push('/(tabs)/settings');
      } else if (data?.type === 'LOCAL_NOTIFICATION') {
        // 로컬 알림인 경우 알림 탭으로 이동
        router.push('/(tabs)/notifications');
      }
    });

    // 로컬 참조 업데이트
    notificationListener.current = globalNotificationListener;
    responseListener.current = globalResponseListener;

    isInitialized = true;
    console.log('✅ usePushNotifications: 초기화 완료');

    return () => {
      console.log('🔄 usePushNotifications: 정리 중...');
      // 전역 리스너는 앱 종료 시에만 정리
    };
  }, [router, addNotificationToHistory]);

  // 로컬 알림 스케줄링 (Expo Go에서 작동)
  const scheduleLocalNotification = async (title: string, body: string, trigger?: any, notificationType: string = 'LOCAL_NOTIFICATION') => {
    try {
      console.log('📱 scheduleLocalNotification 호출됨:', title, body, notificationType);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: notificationType },
        },
        trigger: trigger || null, // null이면 즉시 발송
      });
      
      console.log('✅ 로컬 알림 스케줄됨:', notificationId, notificationType);
      return notificationId;
    } catch (error) {
      console.error('❌ 로컬 알림 스케줄링 실패:', error);
      return null;
    }
  };

  // 즉시 로컬 알림 발송 (테스트용)
  const sendImmediateNotification = async (title: string, body: string) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'LOCAL_NOTIFICATION' },
        },
        trigger: null, // 즉시 발송
      });
      
      console.log('✅ 즉시 알림 발송됨:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ 즉시 알림 발송 실패:', error);
      return null;
    }
  };

  // 모든 알림 취소
  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('모든 알림이 취소되었습니다.');
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
  };

  // 특정 알림 취소
  const cancelNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('알림이 취소되었습니다:', notificationId);
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
  };

  return {
    scheduleLocalNotification,
    sendImmediateNotification,
    cancelAllNotifications,
    cancelNotification,
  };
}; 