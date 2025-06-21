import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import EnvConfig from './env';

// Firebase 설정
const firebaseConfig = EnvConfig.FIREBASE_CONFIG;

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// FCM 메시징 초기화 (웹에서만 사용)
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging initialization failed:', error);
  }
}

/**
 * FCM 토큰 가져오기
 */
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) return null;
  
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY, // 웹 푸시용 VAPID 키
    });
    return token;
  } catch (error) {
    console.error('FCM token retrieval failed:', error);
    return null;
  }
};

/**
 * 포그라운드 메시지 리스너
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, callback);
};

export { app };
export default firebaseConfig; 