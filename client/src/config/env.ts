import Constants from 'expo-constants';

/**
 * 환경 변수 관리 클래스
 * Expo의 환경 변수를 타입 안전하게 관리합니다.
 */
class EnvConfig {
  // API 설정
  static get API_BASE_URL(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    
    // 임시: 하드코딩된 개발 서버 URL
    const developmentUrl = 'http://172.20.10.2:3000/api/v1';
    const defaultUrl = 'http://localhost:3000/api/v1';
    
    // 환경 변수 디버깅
    if (__DEV__) {
      console.log('🔍 API_BASE_URL 환경변수 체크:');
      console.log('- EXPO_PUBLIC_API_BASE_URL:', envUrl);
      console.log('- 개발 서버 URL:', developmentUrl);
      console.log('- 기본값:', defaultUrl);
    }
    
    // 개발 모드에서는 지정된 개발 서버 URL 사용
    if (__DEV__) {
      return envUrl || developmentUrl;
    }
    
    return envUrl || defaultUrl;
  }

  static get API_VERSION(): string {
    return process.env.EXPO_PUBLIC_API_VERSION || 'v1';
  }

  static get FULL_API_URL(): string {
    return this.API_BASE_URL; // 이미 v1이 포함되어 있음
  }

  // 환경 구분
  static get NODE_ENV(): string {
    return process.env.EXPO_PUBLIC_NODE_ENV || 'development';
  }

  static get IS_DEVELOPMENT(): boolean {
    return this.NODE_ENV === 'development';
  }

  static get IS_PRODUCTION(): boolean {
    return this.NODE_ENV === 'production';
  }

  // Firebase 설정 (React Native/Expo용)
  static get FIREBASE_CONFIG() {
    const config = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA4CotimuGNCfppbfONHM3VaAOIccyzfpM',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'cookingingredientmanager.firebaseapp.com',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'cookingingredientmanager',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'cookingingredientmanager.firebasestorage.app',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '981367162693',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:981367162693:android:6c7e013bd64146ecc9a02c',
    };
    
    // 개발 모드에서는 설정 검증
    if (this.IS_DEVELOPMENT) {
      const missingKeys = Object.entries(config)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
        
      if (missingKeys.length > 0) {
        console.warn('⚠️ Firebase 설정 누락:', missingKeys);
      }
    }
    
    return config;
  }

  // 푸시 알림 설정
  static get PUSH_NOTIFICATION_ENABLED(): boolean {
    return process.env.EXPO_PUBLIC_PUSH_NOTIFICATION_ENABLED === 'true';
  }

  // 디버그 설정
  static get DEBUG_MODE(): boolean {
    return process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || __DEV__;
  }

  static get LOG_LEVEL(): 'debug' | 'info' | 'warn' | 'error' {
    return (process.env.EXPO_PUBLIC_LOG_LEVEL as any) || 'debug';
  }

  // 이미지 업로드 설정
  static get MAX_IMAGE_SIZE(): number {
    return parseInt(process.env.EXPO_PUBLIC_MAX_IMAGE_SIZE || '5242880', 10); // 5MB
  }

  static get ALLOWED_IMAGE_FORMATS(): string[] {
    return (process.env.EXPO_PUBLIC_ALLOWED_IMAGE_FORMATS || 'jpg,jpeg,png').split(',');
  }

  // 앱 정보
  static get APP_NAME(): string {
    return process.env.EXPO_PUBLIC_APP_NAME || 'Kooky';
  }

  static get APP_VERSION(): string {
    return process.env.EXPO_PUBLIC_APP_VERSION || Constants.expoConfig?.version || '1.0.0';
  }

  // 환경 변수 검증
  static validate(): void {
    const required = [
      'EXPO_PUBLIC_API_BASE_URL',
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn('⚠️ Missing required environment variables:', missing);
      console.warn('🔧 Using fallback values for development');
      
      if (this.IS_PRODUCTION) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    }
  }

  // 현재 환경 정보 출력 (디버그용)
  static printEnvInfo(): void {
    if (!this.DEBUG_MODE) return;

    console.log('🔧 Environment Configuration:');
    console.log(`- Node Environment: ${this.NODE_ENV}`);
    console.log(`- API Base URL: ${this.API_BASE_URL}`);
    console.log(`- Full API URL: ${this.FULL_API_URL}`);
    console.log(`- Debug Mode: ${this.DEBUG_MODE}`);
    console.log(`- Log Level: ${this.LOG_LEVEL}`);
    console.log(`- Push Notifications: ${this.PUSH_NOTIFICATION_ENABLED}`);
    console.log(`- App Version: ${this.APP_VERSION}`);
    console.log(`- Firebase Project ID: ${this.FIREBASE_CONFIG.projectId || 'NOT_SET'}`);
  }

  // 모든 환경 변수 디버깅 출력
  static printAllEnvVars(): void {
    if (!__DEV__) return;
    
    console.log('📋 모든 EXPO_PUBLIC_ 환경 변수:');
    const exposedVars = Object.keys(process.env)
      .filter(key => key.startsWith('EXPO_PUBLIC_'))
      .sort();
      
    if (exposedVars.length === 0) {
      console.log('- 🚨 EXPO_PUBLIC_ 환경 변수가 하나도 로드되지 않았습니다!');
      console.log('- 💡 앱을 완전히 재시작해보세요 (개발 서버 포함)');
    } else {
      exposedVars.forEach(key => {
        console.log(`- ${key}: ${process.env[key]}`);
      });
    }
  }
}

// 앱 시작 시 환경 변수 검증
EnvConfig.validate();

// 디버그 모드에서 환경 정보 출력
if (__DEV__) {
  EnvConfig.printEnvInfo();
  EnvConfig.printAllEnvVars();
}

export default EnvConfig; 