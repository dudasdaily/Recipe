// dotenv 강제 로딩 (path를 명시적으로 지정)
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// .env 파일 강제 로드
const envPath = path.resolve(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });

// 백업 방법: .env 파일을 직접 읽어서 파싱 (dotenv가 실패한 경우)
let manualEnvVars = {};
try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    
    envContent.split('\n').forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return; // 빈 줄이나 주석 스킵
      }
      
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        const cleanKey = key.trim();
        manualEnvVars[cleanKey] = value;
        

        
        // process.env에 수동으로 설정 (dotenv가 실패한 경우)
        if (!process.env[cleanKey]) {
          process.env[cleanKey] = value;
        }
      }
    });
  }
} catch (error) {
  // .env 파일 수동 파싱 실패
}

// 최종 백업: 특정 키를 직접 찾는 함수 (BOM 처리 포함)
function getEnvValueDirectly(envContent, targetKey) {
  // BOM 제거
  const cleanContent = envContent.replace(/^\uFEFF/, '');
  const lines = cleanContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // BOM이나 특수 문자 제거
    const cleanLine = trimmed.replace(/[^\x20-\x7E]/g, '');
    
    if (cleanLine.startsWith(targetKey + '=')) {
      const value = cleanLine.substring(targetKey.length + 1);
      return value;
    }
    
    // 원본 line도 체크 (특수문자 제거 안한 버전)
    if (trimmed.startsWith(targetKey + '=')) {
      const value = trimmed.substring(targetKey.length + 1);
      return value;
    }
  }
  return null;
}

// .env 파일에서 API_BASE_URL을 직접 추출
let directApiBaseUrl = null;
try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    directApiBaseUrl = getEnvValueDirectly(envContent, 'EXPO_PUBLIC_API_BASE_URL');
  }
} catch (error) {
  // 직접 검색 실패
}

export default {
  expo: {
    name: "Kooky",
    slug: "kooky",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "kooky",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#f8f9fa"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.recipe.app",
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#f8f9fa"
      },
      package: "com.recipe.app"
    },
    plugins: [
      "expo-router",
      "expo-camera",
      "expo-image-picker",
      "expo-notifications"
    ],
    extra: {
      eas: {
        projectId: "recipe-ingredient-manager"
      },
      // 환경 변수를 Expo config에 주입 (직접 검색된 값을 최최우선으로 사용)
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || directApiBaseUrl || manualEnvVars.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3000/api/v1',
      nodeEnv: process.env.EXPO_PUBLIC_NODE_ENV || manualEnvVars.EXPO_PUBLIC_NODE_ENV || process.env.NODE_ENV || 'development',
      debugMode: (process.env.EXPO_PUBLIC_DEBUG_MODE || manualEnvVars.EXPO_PUBLIC_DEBUG_MODE || process.env.DEBUG_MODE) === 'true',
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || manualEnvVars.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || manualEnvVars.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      // 기타 환경 변수들 (수동 파싱 백업 포함)
      pushNotificationEnabled: (process.env.EXPO_PUBLIC_PUSH_NOTIFICATION_ENABLED || manualEnvVars.EXPO_PUBLIC_PUSH_NOTIFICATION_ENABLED || process.env.PUSH_NOTIFICATION_ENABLED) === 'true',
      appName: process.env.EXPO_PUBLIC_APP_NAME || manualEnvVars.EXPO_PUBLIC_APP_NAME || process.env.APP_NAME || 'Kooky',
      appVersion: process.env.EXPO_PUBLIC_APP_VERSION || manualEnvVars.EXPO_PUBLIC_APP_VERSION || process.env.APP_VERSION || '1.0.0',
    },
    notification: {
      icon: "./assets/images/notification-icon.png"
    }
  }
}; 