import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '../stores/notification';
import { getFCMToken } from '../config/firebase';

/**
 * FCM 토큰 관리를 위한 커스텀 훅
 */
export const useFCMToken = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    fcmToken,
    setFCMToken,
    registerTokenWithServer,
    isTokenRegistered,
    error,
    clearError,
  } = useNotificationStore();

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    try {
      console.log('📱 알림 권한 요청 시작');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      console.log(`현재 알림 권한 상태: ${existingStatus}`);
      
      if (existingStatus !== 'granted') {
        console.log('알림 권한 요청 중...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log(`알림 권한 요청 결과: ${status}`);
      }
      
      if (finalStatus !== 'granted') {
        console.warn('❌ 알림 권한이 거부되었습니다.');
        return false;
      }
      
      console.log('✅ 알림 권한 승인됨');
      return true;
    } catch (error) {
      console.error('❌ 알림 권한 요청 중 오류:', error);
      return false;
    }
  };

  // FCM 토큰 초기화
  const initializeFCMToken = async () => {
    try {
      console.log('🔄 FCM 토큰 초기화 시작');
      clearError(); // 이전 오류 초기화
      
      // 알림 권한 요청
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        console.log('❌ 알림 권한이 없어 토큰을 생성할 수 없습니다.');
        setIsInitialized(true);
        return;
      }

      // 개발 모드에서는 항상 테스트 토큰 생성
      if (__DEV__) {
        console.log('🧪 개발 모드: 테스트용 FCM 토큰 생성');
        const testToken = `test-expo-token-${Date.now()}`;
        setFCMToken(testToken);
        console.log('✅ 테스트 FCM 토큰 생성 완료:', testToken);
        setIsInitialized(true);
        return;
      }

      // 프로덕션 모드에서의 토큰 생성
      if (Platform.OS !== 'web') {
        try {
          console.log('📲 Expo Push Token 생성 중...');
          const expoToken = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'test-project-id',
          });
          
          if (expoToken?.data) {
            setFCMToken(expoToken.data);
            console.log('✅ Expo FCM 토큰 생성 성공:', expoToken.data);
          } else {
            throw new Error('Expo 토큰 데이터가 없습니다.');
          }
        } catch (error) {
          console.warn('❌ Expo 토큰 생성 실패, 테스트 토큰 사용:', error);
          const testToken = `test-expo-token-${Date.now()}`;
          setFCMToken(testToken);
          console.log('🔄 대체 테스트 토큰 생성:', testToken);
        }
      } else {
        // 웹에서는 Firebase 토큰 사용
        console.log('🌐 웹 환경: Firebase FCM 토큰 생성 중...');
        const firebaseToken = await getFCMToken();
        if (firebaseToken) {
          setFCMToken(firebaseToken);
          console.log('✅ Firebase FCM 토큰 생성 성공:', firebaseToken);
        } else {
          // Firebase 토큰 생성 실패 시 테스트 토큰 사용
          const testToken = `test-web-token-${Date.now()}`;
          setFCMToken(testToken);
          console.log('🔄 웹 테스트 토큰 생성:', testToken);
        }
      }
    } catch (error) {
      console.error('❌ FCM 토큰 초기화 중 오류:', error);
      // 오류 발생 시에도 테스트 토큰 생성
      const testToken = `test-error-token-${Date.now()}`;
      setFCMToken(testToken);
      console.log('🆘 오류로 인한 테스트 FCM 토큰 생성:', testToken);
    } finally {
      setIsInitialized(true);
      console.log('✅ FCM 토큰 초기화 완료');
    }
  };

  // 토큰을 서버에 등록
  const registerToken = async () => {
    if (fcmToken && !isTokenRegistered) {
      try {
        console.log('🚀 FCM 토큰 서버 등록 시작:', fcmToken.substring(0, 20) + '...');
        await registerTokenWithServer();
        console.log('✅ FCM 토큰이 서버에 성공적으로 등록되었습니다.');
      } catch (error) {
        console.error('❌ FCM 토큰 등록 실패:', error);
        // 등록 실패해도 앱은 계속 사용 가능
      }
    } else if (!fcmToken) {
      console.log('⚠️ 등록할 FCM 토큰이 없습니다.');
    } else if (isTokenRegistered) {
      console.log('ℹ️ FCM 토큰이 이미 등록되어 있습니다.');
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    console.log('🏁 useFCMToken 훅 초기화 시작');
    initializeFCMToken();
  }, []);

  // 토큰이 있으면 서버에 등록
  useEffect(() => {
    if (isInitialized && fcmToken) {
      console.log('🔗 FCM 토큰 서버 등록 준비:', {
        isInitialized,
        hasToken: !!fcmToken,
        isTokenRegistered,
      });
      registerToken();
    }
  }, [isInitialized, fcmToken, isTokenRegistered]);

  return {
    fcmToken,
    isInitialized,
    isTokenRegistered,
    error,
    requestNotificationPermission,
    registerToken,
  };
}; 