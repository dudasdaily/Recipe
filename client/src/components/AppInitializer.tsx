import React from 'react';
import { useIngredientsCache } from '../hooks/useIngredientsCache';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useLocalNotificationService } from '../hooks/useLocalNotificationService';

/**
 * QueryClientProvider 안에서 실행되는 앱 초기화 컴포넌트
 */
export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 재료 데이터 캐싱 초기화
  useIngredientsCache();

  // 전역 에러 핸들러 초기화
  useErrorHandler();

  // 로컬 알림 서비스 초기화
  useLocalNotificationService();

  // 모든 하위 컴포넌트를 렌더링
  return <>{children}</>;
}; 