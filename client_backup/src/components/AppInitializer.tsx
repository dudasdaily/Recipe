import React from 'react';
import { useLocalExpiryNotification } from '../hooks/useLocalExpiryNotification';
import { useIngredientsCache } from '../hooks/useIngredientsCache';
import { useErrorHandler } from '../hooks/useErrorHandler';

/**
 * QueryClientProvider 안에서 실행되는 앱 초기화 컴포넌트
 * 로컬 알림만 사용하는 간소화된 버전
 */
export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 로컬 유통기한 알림 초기화 (로컬 알림만 사용)
  useLocalExpiryNotification();

  // 재료 데이터 캐싱 초기화
  useIngredientsCache();

  // 전역 에러 핸들러 초기화
  useErrorHandler();

  // 모든 하위 컴포넌트를 렌더링
  return <>{children}</>;
}; 