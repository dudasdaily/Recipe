import { useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotificationStore } from '../stores/notification';
import { usePushNotifications } from './usePushNotifications';

// 로컬 알림 스케줄 저장 키
const LOCAL_NOTIFICATION_SCHEDULE_KEY = 'local_notification_schedule';

type ExpiryNotificationData = {
  ingredientId: number;
  name: string;
  expiryDate: string;
  quantity: number;
  unit?: string;
};

/**
 * 오프라인에서도 작동하는 로컬 유통기한 알림 시스템
 */
export const useLocalExpiryNotification = () => {
  const { enabled, notificationTime, notificationDays } = useNotificationStore();
  const { scheduleLocalNotification, cancelAllNotifications } = usePushNotifications();
  
  // 디바운싱을 위한 ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScheduledRef = useRef<string>('');
  const isSchedulingRef = useRef<boolean>(false);

  // 유통기한 임박 재료 확인 (실제 서버 데이터 사용)
  const getExpiringIngredients = useCallback(async (): Promise<ExpiryNotificationData[]> => {
    try {
      const { getIngredients } = await import('../services/api/ingredients');
      const ingredients = await getIngredients();
      
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);

      const expiringIngredients = ingredients.filter((ingredient: any) => {
        const expiryDate = new Date(ingredient.expiry_date);
        return expiryDate <= threeDaysLater && expiryDate > new Date();
      }).map((ingredient: any) => ({
        ingredientId: ingredient.id,
        name: ingredient.name,
        expiryDate: ingredient.expiry_date,
        quantity: ingredient.quantity,
        unit: ingredient.unit || '개'
      }));

      console.log(`📦 로컬 알림: ${expiringIngredients.length}개의 유통기한 임박 재료 발견`);
      return expiringIngredients;
    } catch (error) {
      console.error('❌ 유통기한 임박 재료 조회 실패 (오프라인일 수 있음):', error);
      
      // 오프라인인 경우 로컬 캐시된 데이터 시도
      try {
        const cachedData = await AsyncStorage.getItem('cached_ingredients');
        if (cachedData) {
          const ingredients = JSON.parse(cachedData);
          const threeDaysLater = new Date();
          threeDaysLater.setDate(threeDaysLater.getDate() + 3);

          const expiringIngredients = ingredients.filter((ingredient: any) => {
            const expiryDate = new Date(ingredient.expiry_date);
            return expiryDate <= threeDaysLater && expiryDate > new Date();
          }).map((ingredient: any) => ({
            ingredientId: ingredient.id,
            name: ingredient.name,
            expiryDate: ingredient.expiry_date,
            quantity: ingredient.quantity,
            unit: ingredient.unit || '개'
          }));

          console.log(`📦 로컬 캐시: ${expiringIngredients.length}개의 유통기한 임박 재료 발견`);
          return expiringIngredients;
        }
      } catch (cacheError) {
        console.error('❌ 로컬 캐시 조회도 실패:', cacheError);
      }
      
      return [];
    }
  }, []);

  // 로컬 알림 스케줄링
  const scheduleExpiryNotifications = useCallback(async () => {
    // 중복 실행 방지
    if (isSchedulingRef.current) {
      console.log('⏸️ 이미 스케줄링 중이므로 건너뜀');
      return;
    }

    if (!enabled) {
      console.log('ℹ️ 알림이 비활성화되어 있어 스케줄링을 건너뜀');
      return;
    }

    try {
      isSchedulingRef.current = true;
      console.log('📅 로컬 유통기한 알림 스케줄링 시작...');

      // 설정 변경 체크 (중복 스케줄링 방지)
      const currentSettings = `${enabled}-${notificationTime}-${notificationDays.join(',')}`;
      if (lastScheduledRef.current === currentSettings) {
        console.log('⏸️ 설정이 변경되지 않아 스케줄링 건너뜀');
        return;
      }

      // 기존 알림 취소
      await cancelAllNotifications();

      // 유통기한 임박 재료 조회
      const expiringIngredients = await getExpiringIngredients();
      
      if (expiringIngredients.length === 0) {
        console.log('ℹ️ 유통기한 임박 재료가 없어 알림을 스케줄하지 않음');
        lastScheduledRef.current = currentSettings;
        return;
      }

      console.log(`📦 ${expiringIngredients.length}개의 유통기한 임박 재료 발견`);

      // 알림 시간 파싱
      const [hours, minutes] = notificationTime.split(':').map(Number);

      // 각 설정된 요일에 대해 알림 스케줄링 (하루에 하나씩만)
      const scheduledNotifications: string[] = [];
      const today = new Date().getDay();
      let nextScheduleDay = notificationDays.find(day => day >= today) ?? notificationDays[0];
      
      // 오늘이 알림 날짜이고 이미 시간이 지났다면 다음 주로
      if (nextScheduleDay === today) {
        const now = new Date();
        const todayAlarmTime = new Date();
        todayAlarmTime.setHours(hours, minutes, 0, 0);
        
        if (now > todayAlarmTime) {
          const nextWeekDays = notificationDays.filter(day => day > today);
          nextScheduleDay = nextWeekDays.length > 0 ? nextWeekDays[0] : notificationDays[0];
        }
      }

      // 하나의 알림만 스케줄 (가장 가까운 날짜)
      const nextNotificationDate = getNextNotificationDate(nextScheduleDay, hours, minutes);
      
      const title = '유통기한 임박 알림';
      const body = `${expiringIngredients.length}개의 재료가 곧 유통기한이 만료됩니다`;

      // 재료 정보를 포함하여 알림 스케줄링
      const notificationId = await scheduleLocalNotification(
        title,
        body,
        { 
          date: nextNotificationDate,
          // 재료 정보를 data에 포함
          data: {
            expiringIngredients,
            scheduledTime: nextNotificationDate.toISOString(),
          }
        },
        'EXPIRY_ALERT'
      );

      if (notificationId) {
        scheduledNotifications.push(notificationId);
        console.log(`✅ ${nextScheduleDay}요일 ${notificationTime} 알림 스케줄됨 (${nextNotificationDate.toLocaleString()})`);
      }

      // 스케줄된 알림 ID들을 저장
      await AsyncStorage.setItem(
        LOCAL_NOTIFICATION_SCHEDULE_KEY,
        JSON.stringify({
          scheduledIds: scheduledNotifications,
          lastScheduled: new Date().toISOString(),
          expiringIngredients,
          settings: currentSettings
        })
      );

      lastScheduledRef.current = currentSettings;
      console.log(`🎉 총 ${scheduledNotifications.length}개의 로컬 알림이 스케줄되었습니다.`);
    } catch (error) {
      console.error('❌ 로컬 유통기한 알림 스케줄링 실패:', error);
    } finally {
      isSchedulingRef.current = false;
    }
  }, [enabled, notificationTime, notificationDays, getExpiringIngredients, scheduleLocalNotification, cancelAllNotifications]);

  // 다음 알림 날짜 계산 (개선된 버전)
  const getNextNotificationDate = (dayOfWeek: number, hours: number, minutes: number): Date => {
    const now = new Date();
    const nextDate = new Date();
    
    console.log('📅 시간 계산 시작:', {
      현재시간: now.toLocaleString('ko-KR'),
      현재요일: now.getDay(),
      목표요일: dayOfWeek,
      목표시간: `${hours}:${minutes.toString().padStart(2, '0')}`
    });
    
    // 현재 요일과 목표 요일의 차이 계산
    const currentDay = now.getDay();
    const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
    
    // 목표 시간 설정
    nextDate.setHours(hours, minutes, 0, 0);
    
    // 오늘이 목표 요일인 경우
    if (daysUntilTarget === 0) {
      // 이미 시간이 지났다면 다음 주로
      if (nextDate <= now) {
        nextDate.setDate(nextDate.getDate() + 7);
        console.log('⏰ 오늘 시간이 지나서 다음 주로 설정');
      } else {
        console.log('⏰ 오늘 예정된 시간으로 설정');
      }
    } else {
      // 다른 요일이면 해당 요일로 설정
      nextDate.setDate(now.getDate() + daysUntilTarget);
      console.log(`⏰ ${daysUntilTarget}일 후 (${dayOfWeek}요일)로 설정`);
    }
    
    console.log('✅ 최종 알림 시간:', {
      설정된시간: nextDate.toLocaleString('ko-KR'),
      ISO시간: nextDate.toISOString(),
      현재와차이: Math.round((nextDate.getTime() - now.getTime()) / 60000) + '분 후'
    });
    
    return nextDate;
  };

  // 로컬 알림 즉시 테스트
  const sendTestExpiryNotification = useCallback(async () => {
    try {
      console.log('🧪 로컬 유통기한 알림 테스트...');
      
      const expiringIngredients = await getExpiringIngredients();
      const title = '테스트: 유통기한 임박 알림';
      const body = expiringIngredients.length > 0 
        ? `${expiringIngredients.length}개의 재료가 곧 유통기한이 만료됩니다`
        : '현재 유통기한 임박 재료가 없습니다';

      const notificationId = await scheduleLocalNotification(
        title,
        body,
        null, // 즉시 전송
        'EXPIRY_ALERT'
      );

      if (notificationId) {
        console.log('✅ 테스트 알림이 전송되었습니다.');
        return true;
      } else {
        console.log('❌ 테스트 알림 전송에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('❌ 테스트 알림 전송 실패:', error);
      return false;
    }
  }, [getExpiringIngredients, scheduleLocalNotification]);

  // 스케줄된 알림 정리
  const clearScheduledNotifications = useCallback(async () => {
    try {
      await cancelAllNotifications();
      await AsyncStorage.removeItem(LOCAL_NOTIFICATION_SCHEDULE_KEY);
      lastScheduledRef.current = '';
      console.log('✅ 모든 로컬 알림 스케줄이 정리되었습니다.');
    } catch (error) {
      console.error('❌ 알림 스케줄 정리 실패:', error);
    }
  }, [cancelAllNotifications]);

  // 알림 설정이 변경될 때마다 디바운싱으로 다시 스케줄링
  useEffect(() => {
    // 중복 실행 방지
    if (isSchedulingRef.current) {
      console.log('⏸️ 이미 스케줄링 중이므로 디바운스 건너뜀');
      return;
    }
    
    // 기존 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      console.log('🕒 기존 디바운스 타이머 취소');
    }
    
    timeoutRef.current = setTimeout(() => {
      console.log('🔄 디바운스 완료, 알림 재스케줄링 시작...');
      scheduleExpiryNotifications();
    }, 2000); // 2초 디바운스로 증가
    
    console.log('⏱️ 알림 설정 변경 감지, 2초 후 재스케줄링 예정:', {
      enabled,
      notificationTime,
      notificationDays: notificationDays.join(',')
    });
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled, notificationTime, notificationDays.join(',')]); // 배열을 문자열로 변환하여 비교

  // 스케줄된 알림 확인
  const checkScheduledNotifications = useCallback(async () => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 현재 스케줄된 알림 목록:', {
        총개수: scheduledNotifications.length,
        알림목록: scheduledNotifications.map(notification => ({
          id: notification.identifier,
          title: notification.content.title,
          trigger: notification.trigger,
          scheduledTime: notification.trigger && 'date' in notification.trigger 
            ? new Date((notification.trigger.date as number) * 1000).toLocaleString('ko-KR')
            : '즉시'
        }))
      });
      return scheduledNotifications;
    } catch (error) {
      console.error('❌ 스케줄된 알림 확인 실패:', error);
      return [];
    }
  }, []);

  return {
    scheduleExpiryNotifications,
    sendTestExpiryNotification,
    clearScheduledNotifications,
    getExpiringIngredients,
    checkScheduledNotifications,
  };
}; 