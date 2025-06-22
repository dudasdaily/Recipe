import { useEffect, useCallback, useRef } from 'react';
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
  
  // 중복 스케줄링 방지를 위한 ref
  const isSchedulingRef = useRef(false);
  const lastScheduledSettingsRef = useRef<string>('');
  const notificationListenerRef = useRef<any>(null);
  const lastNotificationIdRef = useRef<string>('');

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

  // 로컬 알림 스케줄링 (중복 방지)
  const scheduleNotification = useCallback(async () => {
    // 중복 스케줄링 방지
    if (isSchedulingRef.current) {
      return;
    }

    // 설정 변경 확인 (중복 스케줄링 방지)
    const currentSettings = `${enabled}-${time}-${daysThreshold}`;
    if (lastScheduledSettingsRef.current === currentSettings && enabled) {
      return;
    }

    if (!enabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      lastScheduledSettingsRef.current = currentSettings;
      return;
    }

    isSchedulingRef.current = true;

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return;
      }

      const { expiredIngredients, expiringIngredients } = analyzeIngredients(ingredients);

      // 기존 알림 취소
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // 취소 후 잠시 대기 (시스템 처리 시간 확보)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 알림할 내용이 있을 때만 스케줄링
      if (expiredIngredients.length > 0 || expiringIngredients.length > 0) {
        const message = createNotificationMessage(expiredIngredients, expiringIngredients);
        
        // 시간 파싱
        const [hours, minutes] = time.split(':').map(Number);

        // 첫 번째 알림 시간 계산
        const firstNotificationTime = new Date();
        firstNotificationTime.setHours(hours, minutes, 0, 0);
        
        // 만약 오늘의 알림 시간이 이미 지났다면 내일로 설정
        if (firstNotificationTime <= new Date()) {
          firstNotificationTime.setDate(firstNotificationTime.getDate() + 1);
        }
        
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

        // 마지막 알림 ID 저장
        lastNotificationIdRef.current = notificationId;
              }

      // 설정 저장
      lastScheduledSettingsRef.current = currentSettings;
    } catch (error) {
      // 알림 스케줄링 실패 시 무시
    } finally {
      isSchedulingRef.current = false;
    }
  }, [enabled, time, daysThreshold, ingredients]);

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

    } catch (error) {
      // 테스트 알림 발송 실패 시 무시
    }
  }, [ingredients, requestPermissions, analyzeIngredients, createNotificationMessage]);



  // 알림 수신 리스너 (매일 반복을 위한) - 단일 인스턴스 보장
  useEffect(() => {
    // 기존 리스너 제거
    if (notificationListenerRef.current) {
      notificationListenerRef.current.remove();
      notificationListenerRef.current = null;
    }

    // 새 리스너 등록
    notificationListenerRef.current = Notifications.addNotificationReceivedListener(notification => {
      const { data } = notification.request.content;
      const notificationId = notification.request.identifier;
      
      // 유통기한 알림이 수신되면 다음 날 알림을 다시 스케줄
      if (data?.type === 'EXPIRY_ALERT' && enabled) {
        // 중복 수신 방지 - 같은 알림 ID면 무시
        if (lastNotificationIdRef.current === notificationId) {
          return;
        }
        
        // 중복 스케줄링 방지 - 이미 스케줄링 중이면 무시
        if (isSchedulingRef.current) {
          return;
        }
        
        // 처리된 알림 ID 저장
        lastNotificationIdRef.current = notificationId;
        
        // 설정 초기화하여 다음 날 알림 스케줄 가능하도록
        setTimeout(() => {
          lastScheduledSettingsRef.current = '';
          scheduleNotification();
        }, 2000);
      }
    });

    return () => {
      if (notificationListenerRef.current) {
        notificationListenerRef.current.remove();
        notificationListenerRef.current = null;
      }
    };
  }, []); // 의존성 제거하여 마운트 시에만 실행

  // 설정 변경 시에만 알림 재스케줄링 (ingredients는 제외)
  useEffect(() => {
    scheduleNotification();
  }, [enabled, time, daysThreshold]); // scheduleNotification 의존성 제거

  // 재료 데이터 변경 시 알림 내용 업데이트 (디바운싱 적용)
  useEffect(() => {
    if (!enabled || ingredients.length === 0) return;

    // 설정이 초기화된 상태에서만 재료 변경 시 업데이트
    const currentSettings = `${enabled}-${time}-${daysThreshold}`;
    if (lastScheduledSettingsRef.current !== currentSettings) return;

    const timeoutId = setTimeout(() => {
      lastScheduledSettingsRef.current = ''; // 설정 초기화
      scheduleNotification();
    }, 1000); // 1초 디바운싱

    return () => clearTimeout(timeoutId);
  }, [ingredients]); // 의존성 배열 최소화

  return {
    scheduleNotification,
    sendTestNotification,
    requestPermissions,
  };
}; 