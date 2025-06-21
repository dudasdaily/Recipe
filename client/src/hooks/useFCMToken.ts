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
  } = useNotificationStore();

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('알림 권한이 거부되었습니다.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('알림 권한 요청 중 오류:', error);
      return false;
    }
  };

  // FCM 토큰 초기화
  const initializeFCMToken = async () => {
    try {
      // 알림 권한 요청
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        console.log('알림 권한이 없어 토큰을 생성할 수 없습니다.');
        setIsInitialized(true);
        return;
      }

      // Expo Go에서는 제한이 있으므로 테스트용 토큰 생성
      if (__DEV__) {
        console.log('개발 모드: 테스트용 FCM 토큰 생성');
        const testToken = `test-expo-token-${Date.now()}`;
        setFCMToken(testToken);
        console.log('테스트 FCM 토큰:', testToken);
        setIsInitialized(true);
        return;
      }

      // Expo 토큰 가져오기 (모바일)
      if (Platform.OS !== 'web') {
        try {
          const expoToken = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'test-project-id',
          });
          
          if (expoToken?.data) {
            setFCMToken(expoToken.data);
            console.log('Expo FCM 토큰:', expoToken.data);
          }
        } catch (error) {
          console.warn('Expo 토큰 생성 실패, 테스트 토큰 사용:', error);
          const testToken = `test-expo-token-${Date.now()}`;
          setFCMToken(testToken);
        }
      } else {
        // 웹에서는 Firebase 토큰 사용
        const firebaseToken = await getFCMToken();
        if (firebaseToken) {
          setFCMToken(firebaseToken);
          console.log('Firebase FCM 토큰:', firebaseToken);
        } else {
          // Firebase 토큰 생성 실패 시 테스트 토큰 사용
          const testToken = `test-web-token-${Date.now()}`;
          setFCMToken(testToken);
          console.log('테스트 웹 FCM 토큰:', testToken);
        }
      }
    } catch (error) {
      console.error('FCM 토큰 초기화 중 오류:', error);
      // 오류 발생 시에도 테스트 토큰 생성
      const testToken = `test-error-token-${Date.now()}`;
      setFCMToken(testToken);
      console.log('오류로 인한 테스트 FCM 토큰:', testToken);
    } finally {
      setIsInitialized(true);
    }
  };

  // 토큰을 서버에 등록
  const registerToken = async () => {
    if (fcmToken && !isTokenRegistered) {
      try {
        await registerTokenWithServer();
        console.log('FCM 토큰이 서버에 등록되었습니다.');
      } catch (error) {
        console.error('FCM 토큰 등록 실패:', error);
      }
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initializeFCMToken();
  }, []);

  // 토큰이 있으면 서버에 등록
  useEffect(() => {
    if (isInitialized && fcmToken) {
      registerToken();
    }
  }, [isInitialized, fcmToken, isTokenRegistered]);

  return {
    fcmToken,
    isInitialized,
    isTokenRegistered,
    requestNotificationPermission,
    registerToken,
  };
}; 