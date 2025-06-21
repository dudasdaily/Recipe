import Constants from 'expo-constants';

/**
 * 환경 변수 관리 클래스
 * Expo의 환경 변수를 타입 안전하게 관리합니다.
 */
class EnvConfig {
  // API 설정
  static get API_BASE_URL(): string {
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  }

  static get API_VERSION(): string {
    return process.env.EXPO_PUBLIC_API_VERSION || 'v1';
  }

  static get FULL_API_URL(): string {
    return `${this.API_BASE_URL}/${this.API_VERSION}`;
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

  // Firebase 설정
  static get FIREBASE_CONFIG() {
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };
  }

  // 푸시 알림 설정
  static get PUSH_NOTIFICATION_ENABLED(): boolean {
    return process.env.EXPO_PUBLIC_PUSH_NOTIFICATION_ENABLED === 'true';
  }

  // 디버그 설정
  static get DEBUG_MODE(): boolean {
    return process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
  }

  static get LOG_LEVEL(): 'debug' | 'info' | 'warn' | 'error' {
    return (process.env.EXPO_PUBLIC_LOG_LEVEL as any) || 'info';
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
    return process.env.EXPO_PUBLIC_APP_NAME || 'Recipe Manager';
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
  }
}

// 앱 시작 시 환경 변수 검증
EnvConfig.validate();

// 디버그 모드에서 환경 정보 출력
if (__DEV__) {
  EnvConfig.printEnvInfo();
}

export default EnvConfig; 