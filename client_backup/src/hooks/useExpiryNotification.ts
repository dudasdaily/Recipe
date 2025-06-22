import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../stores/notification';
import { usePushNotifications } from './usePushNotifications';
import { getIngredients } from '../services/api/ingredients';
import { Ingredient } from '../types/api';

// 전역 플래그로 중복 초기화 방지
let isExpiryNotificationInitialized = false;

/**
 * 유통기한 임박 식재료 알림을 위한 커스텀 훅
 */
export const useExpiryNotification = () => {
  const { enabled, notificationTime, notificationDays } = useNotificationStore();
  const { scheduleLocalNotification } = usePushNotifications();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMonitoringRef = useRef<boolean>(false); // 모니터링 상태 추적

  // 전역 변수들 (앱 전체에서 공유)
  let lastNotificationDate = '';
  let isNotificationLocked = false;

  // 유통기한 임박 식재료 확인 (3일 이하)
  const checkExpiringIngredients = async (): Promise<Ingredient[]> => {
    try {
      const ingredients = await getIngredients();
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      return ingredients.filter(ingredient => {
        const expiryDate = new Date(ingredient.expiry_date);
        return expiryDate <= threeDaysFromNow && expiryDate >= now;
      });
    } catch (error) {
      console.error('유통기한 임박 식재료 확인 실패:', error);
      return [];
    }
  };

  // 알림 메시지 생성
  const createExpiryMessage = (expiringIngredients: Ingredient[]): { title: string; body: string } => {
    if (expiringIngredients.length === 0) {
      return {
        title: '유통기한 알림',
        body: '유통기한이 임박한 식재료가 없습니다.',
      };
    }

    if (expiringIngredients.length === 1) {
      const ingredient = expiringIngredients[0];
      const daysLeft = Math.ceil((new Date(ingredient.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        title: '유통기한 임박 알림',
        body: `${ingredient.name}의 유통기한이 ${daysLeft}일 남았습니다.`,
      };
    }

    const ingredientNames = expiringIngredients.slice(0, 3).map(i => i.name).join(', ');
    const remainingCount = expiringIngredients.length - 3;
    
    return {
      title: '유통기한 임박 알림',
      body: `${ingredientNames}${remainingCount > 0 ? ` 외 ${remainingCount}개` : ''}의 유통기한이 임박했습니다.`,
    };
  };

  // 알림 시간 확인
  const isNotificationTime = (): boolean => {
    if (!enabled) return false;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm 형식
    const currentDay = now.getDay(); // 0: Sunday, 1: Monday, ...
    const currentDate = now.toDateString(); // 날짜만 추출

    // 디버깅 로그
    console.log('알림 시간 확인:', {
      enabled,
      currentTime,
      notificationTime,
      currentDay,
      notificationDays,
      currentDate,
      lastNotificationDate,
      timeMatch: currentTime === notificationTime,
      dayMatch: notificationDays.includes(currentDay),
      alreadyNotified: lastNotificationDate === currentDate,
      isLocked: isNotificationLocked,
    });

    // 알림 시간과 요일 확인
    const isCorrectTime = currentTime === notificationTime && notificationDays.includes(currentDay);
    
    // 같은 날에 이미 알림을 보냈는지 확인
    const alreadyNotifiedToday = lastNotificationDate === currentDate;
    
    const shouldNotify = isCorrectTime && !alreadyNotifiedToday && !isNotificationLocked;
    
    if (shouldNotify) {
      console.log('🎯 알림 발송 조건 만족! 알림 발송 시작...');
    } else if (isCorrectTime && alreadyNotifiedToday) {
      console.log('⏰ 시간은 맞지만 오늘 이미 알림을 보냈습니다.');
    } else if (isCorrectTime && isNotificationLocked) {
      console.log('🔒 시간은 맞지만 알림이 잠겨있습니다.');
    } else if (currentTime === notificationTime && !notificationDays.includes(currentDay)) {
      console.log('📅 시간은 맞지만 요일이 맞지 않습니다.');
    } else if (notificationDays.includes(currentDay) && currentTime !== notificationTime) {
      console.log('⏰ 요일은 맞지만 시간이 맞지 않습니다.');
    }
    
    return shouldNotify;
  };

  // 유통기한 알림 발송
  const sendExpiryNotification = async () => {
    console.log('sendExpiryNotification 호출됨, enabled:', enabled);
    
    if (!enabled) {
      console.log('알림이 비활성화되어 있어 발송하지 않습니다.');
      return;
    }

    // 전역 락 체크
    if (isNotificationLocked) {
      console.log('전역 락: 이미 알림을 발송 중입니다.');
      return;
    }

    // 오늘 이미 알림을 보냈는지 확인
    const today = new Date().toDateString();
    if (lastNotificationDate === today) {
      console.log('오늘 이미 알림을 보냈습니다. 중복 발송 방지.');
      return;
    }

    // 전역 락 설정
    isNotificationLocked = true;
    console.log('전역 락 설정됨');

    try {
      console.log('유통기한 임박 식재료 확인 중...');
      const expiringIngredients = await checkExpiringIngredients();
      console.log('확인된 임박 식재료:', expiringIngredients);
      
      const { title, body } = createExpiryMessage(expiringIngredients);
      console.log('생성된 알림 메시지:', { title, body });

      // 유통기한 임박 식재료가 있을 때만 알림 발송
      if (expiringIngredients.length > 0) {
        console.log('알림 발송 시작...');
        
        // 발송 전 한 번 더 중복 체크
        if (lastNotificationDate === today) {
          console.log('발송 직전 중복 체크: 오늘 이미 알림을 보냈습니다.');
          return;
        }
        
        await scheduleLocalNotification(title, body);
        
        // 전역 상태 업데이트
        lastNotificationDate = today;
        
        console.log('유통기한 임박 알림 발송 완료:', { title, body, count: expiringIngredients.length });
      } else {
        console.log('유통기한 임박 식재료가 없어 알림을 발송하지 않습니다.');
      }
    } catch (error) {
      console.error('유통기한 알림 발송 실패:', error);
      throw error; // 에러를 다시 던져서 호출자가 처리할 수 있도록
    } finally {
      // 전역 락 해제
      isNotificationLocked = false;
      console.log('전역 락 해제됨');
    }
  };

  // 주기적 확인 (1분마다)
  useEffect(() => {
    // 이미 초기화되었으면 중복 초기화 방지
    if (isExpiryNotificationInitialized) {
      console.log('🚫 useExpiryNotification: 이미 초기화됨, 중복 초기화 방지');
      return;
    }

    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isMonitoringRef.current = false;
        console.log('유통기한 알림 모니터링 중지 (비활성화)');
      }
      return;
    }

    // 이미 모니터링 중이면 중복 시작 방지
    if (isMonitoringRef.current) {
      console.log('이미 모니터링 중입니다. 중복 시작 방지.');
      return;
    }

    console.log('✅ useExpiryNotification: 초기화 시작');
    console.log('유통기한 알림 모니터링 시작:', {
      enabled,
      notificationTime,
      notificationDays,
    });

    isMonitoringRef.current = true;
    isExpiryNotificationInitialized = true;

    // 1분마다 알림 시간 확인
    intervalRef.current = setInterval(() => {
      console.log('알림 시간 체크 중...');
      if (isNotificationTime()) {
        console.log('🎯 알림 발송 조건 만족! 알림 발송 시작...');
        sendExpiryNotification();
      }
    }, 60000); // 1분 = 60000ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        isMonitoringRef.current = false;
        console.log('유통기한 알림 모니터링 중지 (정리)');
      }
    };
  }, [enabled, notificationTime, notificationDays]);

  // 수동 알림 발송 (테스트용)
  const sendManualExpiryNotification = async () => {
    console.log('🔍 sendManualExpiryNotification 호출됨');
    
    if (!enabled) {
      console.log('❌ 알림이 비활성화되어 있어 수동 발송도 불가능합니다.');
      throw new Error('알림이 비활성화되어 있습니다. 먼저 알림을 활성화해주세요.');
    }

    // 전역 락 체크
    if (isNotificationLocked) {
      console.log('🔒 전역 락: 이미 알림을 발송 중입니다.');
      throw new Error('이미 알림을 발송 중입니다. 잠시 후 다시 시도해주세요.');
    }

    // 전역 락 설정
    isNotificationLocked = true;
    console.log('🔒 전역 락 설정됨');

    try {
      console.log('🔍 유통기한 임박 식재료 확인 중...');
      const expiringIngredients = await checkExpiringIngredients();
      console.log('📋 확인된 임박 식재료:', expiringIngredients);
      
      const { title, body } = createExpiryMessage(expiringIngredients);
      console.log('📝 생성된 알림 메시지:', { title, body });

      // 수동 발송은 중복 방지 없이 항상 발송
      if (expiringIngredients.length > 0) {
        console.log('🚀 수동 알림 발송 시작...');
        
        // 직접 알림을 히스토리에 저장 (중복 방지)
        const { addNotificationToHistory } = useNotificationStore.getState();
        console.log('💾 히스토리에 알림 저장 중...');
        addNotificationToHistory({
          type: 'EXPIRY_ALERT',
          title,
          body,
          sentAt: new Date().toISOString(),
          readAt: null,
        });
        console.log('✅ 히스토리 저장 완료');
        
        // 로컬 알림 발송 (EXPIRY_ALERT 타입으로 발송하여 중복 저장 방지)
        console.log('📱 로컬 알림 발송 중...');
        await scheduleLocalNotification(title, body, null, 'EXPIRY_ALERT');
        console.log('✅ 로컬 알림 발송 완료');
        
        console.log('🎉 수동 유통기한 알림 발송 완료:', { title, body, count: expiringIngredients.length });
      } else {
        console.log('❌ 유통기한 임박 식재료가 없어 알림을 발송하지 않습니다.');
        throw new Error('유통기한이 임박한 식재료가 없습니다.');
      }
    } catch (error) {
      console.error('❌ 수동 유통기한 알림 발송 실패:', error);
      throw error;
    } finally {
      // 전역 락 해제
      isNotificationLocked = false;
      console.log('🔓 전역 락 해제됨');
    }
  };

  return {
    sendManualExpiryNotification,
    checkExpiringIngredients,
  };
}; 