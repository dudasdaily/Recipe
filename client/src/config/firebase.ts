import { initializeApp } from 'firebase/app';
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

export { app };
export default firebaseConfig; 