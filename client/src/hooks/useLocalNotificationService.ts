import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useLocalNotificationStore } from '../stores/localNotification';
import { useIngredients } from './query/useIngredients';
import type { Ingredient } from '../types/api';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useLocalNotificationService = () => {
  const { enabled, time, daysThreshold } = useLocalNotificationStore();
  const { data: ingredients = [] } = useIngredients();

  // 알림 권한 요청
  const requestPermissions = useCallback(async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ 알림 권한이 거부되었습니다.');
        return false;
      }

      console.log('✅ 알림 권한 승인됨');
      return true;
    } catch (error) {
      console.error('❌ 알림 권한 요청 실패:', error);
      return false;
    }
  }, []);

  // 유통기한 임박/만료 재료 분석
  const analyzeIngredients = useCallback((ingredients: Ingredient[]) => {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    const expiredIngredients: Ingredient[] = [];
    const expiringIngredients: Ingredient[] = [];

    ingredients.forEach(ingredient => {
      // 유통기한이 없는 재료는 건너뛰기
      if (!ingredient.expiry_date) return;

      const expiryDate = new Date(ingredient.expiry_date);
      
      if (expiryDate < today) {
        // 유통기한이 지난 재료
        expiredIngredients.push(ingredient);
      } else if (expiryDate <= thresholdDate) {
        // 유통기한이 임박한 재료
        expiringIngredients.push(ingredient);
      }
    });

    return { expiredIngredients, expiringIngredients };
  }, [daysThreshold]);

  // 알림 메시지 생성
  const createNotificationMessage = useCallback((
    expiredIngredients: Ingredient[],
    expiringIngredients: Ingredient[]
  ) => {
    const messages: string[] = [];

    // 유통기한 임박 메시지
    if (expiringIngredients.length === 1) {
      const ingredient = expiringIngredients[0];
      const expiryDate = new Date(ingredient.expiry_date);
      const today = new Date();
      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      messages.push(`${ingredient.name}의 유통기한이 ${daysLeft}일 남았습니다.`);
    } else if (expiringIngredients.length > 1) {
      const firstIngredient = expiringIngredients[0];
      const remainingCount = expiringIngredients.length - 1;
      
      messages.push(`${firstIngredient.name} 외 ${remainingCount}개의 재료의 유통기한이 임박했습니다.`);
    }

    // 유통기한 만료 메시지
    if (expiredIngredients.length > 0) {
      messages.push(`${expiredIngredients.length}개의 재료가 유통기한이 지났습니다.`);
    }

    return messages.join(' ');
  }, []);

  // 로컬 알림 스케줄링
  const scheduleNotification = useCallback(async () => {
    if (!enabled) {
      console.log('📴 알림이 비활성화되어 있음');
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('❌ 알림 권한이 없음');
      return;
    }

    const { expiredIngredients, expiringIngredients } = analyzeIngredients(ingredients);

    // 기존 알림 취소
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 시간 파싱
    const [hours, minutes] = time.split(':').map(Number);

    // 첫 번째 알림 시간 계산
    const firstNotificationTime = new Date();
    firstNotificationTime.setHours(hours, minutes, 0, 0);
    
    // 만약 오늘의 알림 시간이 이미 지났다면 내일로 설정
    if (firstNotificationTime <= new Date()) {
      firstNotificationTime.setDate(firstNotificationTime.getDate() + 1);
    }

    // 알림할 내용이 있을 때만 스케줄링
    if (expiredIngredients.length > 0 || expiringIngredients.length > 0) {
      const message = createNotificationMessage(expiredIngredients, expiringIngredients);
      
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '유통기한 알림',
            body: message,
            data: { 
              type: 'EXPIRY_ALERT',
              expiredCount: expiredIngredients.length,
              expiringCount: expiringIngredients.length,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: firstNotificationTime,
          },
        });

        console.log(`✅ 로컬 알림 스케줄됨: ${firstNotificationTime.toLocaleString()}`);
        console.log(`📝 알림 내용: ${message}`);
        console.log(`🆔 알림 ID: ${notificationId}`);
      } catch (error) {
        console.error('❌ 로컬 알림 스케줄링 실패:', error);
      }
    } else {
      console.log('📭 현재 알림할 유통기한 관련 재료가 없음');
    }
  }, [enabled, time, daysThreshold, ingredients, requestPermissions, analyzeIngredients, createNotificationMessage]);

  // 즉시 테스트 알림 발송
  const sendTestNotification = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const { expiredIngredients, expiringIngredients } = analyzeIngredients(ingredients);
    const message = createNotificationMessage(expiredIngredients, expiringIngredients) || '현재 알림할 재료가 없습니다.';

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '테스트 알림',
          body: message,
          data: { type: 'TEST_NOTIFICATION' },
        },
        trigger: null, // 즉시 발송
      });

      console.log('✅ 테스트 알림 발송 완료');
    } catch (error) {
      console.error('❌ 테스트 알림 발송 실패:', error);
    }
  }, [ingredients, requestPermissions, analyzeIngredients, createNotificationMessage]);

  // 모든 알림 취소
  const cancelAllNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ 모든 알림 취소됨');
    } catch (error) {
      console.error('❌ 알림 취소 실패:', error);
    }
  }, []);

  // 알림 수신 리스너 (매일 반복을 위한)
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { data } = notification.request.content;
      
      // 유통기한 알림이 수신되면 다음 날 알림을 다시 스케줄
      if (data?.type === 'EXPIRY_ALERT' && enabled) {
        console.log('📱 유통기한 알림 수신, 다음 날 알림 재스케줄링');
        
        // 1초 후에 다음 알림 스케줄 (현재 알림 처리 완료 후)
        setTimeout(() => {
          scheduleNotification();
        }, 1000);
      }
    });

    return () => subscription.remove();
  }, [enabled, scheduleNotification]);

  // 설정 변경 시 알림 재스케줄링
  useEffect(() => {
    if (ingredients.length > 0) {
      scheduleNotification();
    }
  }, [enabled, time, daysThreshold, ingredients, scheduleNotification]);

  return {
    scheduleNotification,
    sendTestNotification,
    cancelAllNotifications,
    requestPermissions,
  };
}; 