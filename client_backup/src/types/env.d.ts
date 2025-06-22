declare module '@env' {
  export const EXPO_PUBLIC_API_BASE_URL: string;
  export const EXPO_PUBLIC_API_VERSION: string;
  export const EXPO_PUBLIC_NODE_ENV: 'development' | 'production' | 'staging';
  export const EXPO_PUBLIC_FIREBASE_API_KEY: string;
  export const EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  export const EXPO_PUBLIC_FIREBASE_PROJECT_ID: string;
  export const EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  export const EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  export const EXPO_PUBLIC_FIREBASE_APP_ID: string;
  export const EXPO_PUBLIC_PUSH_NOTIFICATION_ENABLED: string;
  export const EXPO_PUBLIC_DEBUG_MODE: string;
  export const EXPO_PUBLIC_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  export const EXPO_PUBLIC_MAX_IMAGE_SIZE: string;
  export const EXPO_PUBLIC_ALLOWED_IMAGE_FORMATS: string;
  export const EXPO_PUBLIC_APP_NAME: string;
  export const EXPO_PUBLIC_APP_VERSION: string;
}

// Process env 타입 확장
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_BASE_URL: string;
    EXPO_PUBLIC_API_VERSION: string;
    EXPO_PUBLIC_NODE_ENV: 'development' | 'production' | 'staging';
    EXPO_PUBLIC_FIREBASE_API_KEY: string;
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: string;
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    EXPO_PUBLIC_FIREBASE_APP_ID: string;
    EXPO_PUBLIC_PUSH_NOTIFICATION_ENABLED: string;
    EXPO_PUBLIC_DEBUG_MODE: string;
    EXPO_PUBLIC_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
    EXPO_PUBLIC_MAX_IMAGE_SIZE: string;
    EXPO_PUBLIC_ALLOWED_IMAGE_FORMATS: string;
    EXPO_PUBLIC_APP_NAME: string;
    EXPO_PUBLIC_APP_VERSION: string;
  }
} 