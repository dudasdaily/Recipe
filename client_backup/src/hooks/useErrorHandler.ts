import { useEffect } from 'react';
import { Alert } from 'react-native';
import { apiClient } from '@/services/api/client';
import EnvConfig from '../config/env';

// 에러 로그 전송 함수
const sendErrorLog = async (error: Error, context?: string) => {
  try {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: context || 'unknown',
      timestamp: new Date().toISOString(),
      platform: 'react-native',
      version: EnvConfig.APP_VERSION,
      userAgent: 'Recipe App',
    };

    console.log('에러 로그 전송 중:', errorData);

    await apiClient.post('/error-log', errorData);
    console.log('에러 로그 전송 성공');
  } catch (logError) {
    console.error('에러 로그 전송 중 오류:', logError);
  }
};

/**
 * 전역 에러 핸들링을 위한 커스텀 훅
 */
export const useErrorHandler = () => {
  useEffect(() => {
    // React Native 전역 에러 핸들러 등록
    const originalHandler = global.ErrorUtils?.setGlobalHandler;
    if (originalHandler) {
      originalHandler((error: Error, isFatal?: boolean) => {
        console.error('전역 에러 발생:', {
          message: error.message,
          stack: error.stack,
          isFatal,
          timestamp: new Date().toISOString(),
        });

        // 서버에 에러 로그 전송
        sendErrorLog(error, isFatal ? 'fatal' : 'non-fatal');

        // 사용자에게 알림 (개발 모드에서만)
        if (__DEV__) {
          Alert.alert(
            '알 수 없는 오류가 발생했습니다',
            `오류: ${error.message}\n\n스택 트레이스가 서버에 전송되었습니다.`,
            [
              {
                text: '확인',
                onPress: () => console.log('에러 알림 확인됨'),
              },
            ]
          );
        }
      });
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (originalHandler) {
        originalHandler(null);
      }
    };
  }, []);

  // 수동 에러 로그 전송 함수
  const logError = (error: Error, context?: string) => {
    sendErrorLog(error, context);
  };

  return {
    logError,
  };
}; 