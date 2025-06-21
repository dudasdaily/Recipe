import { initializeApp } from 'firebase/app';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import EnvConfig from './env';

// Firebase 설정
const firebaseConfig = EnvConfig.FIREBASE_CONFIG;

// Firebase 앱 초기화 (개발 모드에서는 선택적으로)
let app: any = null;
try {
  // 실제 Firebase 설정이 있는 경우에만 초기화
  const hasValidConfig = firebaseConfig.projectId && 
                        firebaseConfig.apiKey && 
                        !firebaseConfig.projectId.includes('dev-project');
  
  if (hasValidConfig) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase 앱 초기화 성공');
  } else {
    console.log('ℹ️ 개발 모드: Firebase 초기화 건너뜀 (더미 설정 사용 중)');
  }
} catch (error) {
  console.warn('⚠️ Firebase 초기화 실패, 개발 모드로 계속 진행:', error);
}

/**
 * Expo FCM 토큰 가져오기 (React Native/Expo 환경용)
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // 개발 모드에서는 항상 테스트 토큰 반환
    if (__DEV__) {
      const testToken = `test-firebase-token-${Date.now()}`;
      console.log('🧪 개발 모드: Firebase 테스트 토큰 생성:', testToken);
      return testToken;
    }

    // 알림 권한 확인
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.warn('⚠️ 알림 권한이 필요합니다.');
      return null;
    }

    // 프로덕션 모드에서만 실제 Firebase 토큰 시도
    if (app && Platform.OS !== 'web') {
      try {
        const expoToken = await Notifications.getExpoPushTokenAsync({
          projectId: firebaseConfig.projectId || 'test-project-id',
        });
        
        if (expoToken?.data) {
          console.log('✅ Firebase 기반 FCM 토큰 생성 성공');
          return expoToken.data;
        }
      } catch (error) {
        console.warn('⚠️ Firebase 토큰 생성 실패:', error);
      }
    }

    // 폴백: 테스트 토큰 생성
    const fallbackToken = `fallback-token-${Date.now()}`;
    console.log('🔄 폴백 토큰 생성:', fallbackToken);
    return fallbackToken;
  } catch (error) {
    console.error('❌ FCM 토큰 생성 실패:', error);
    return null;
  }
};

/**
 * 포그라운드 메시지 리스너 (Expo Notifications 사용)
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  try {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    console.log('✅ 포그라운드 메시지 리스너 등록됨');
    return () => {
      subscription.remove();
      console.log('🔄 포그라운드 메시지 리스너 해제됨');
    };
  } catch (error) {
    console.error('❌ 포그라운드 메시지 리스너 등록 실패:', error);
    return () => {};
  }
};

export { app };
export default firebaseConfig; 