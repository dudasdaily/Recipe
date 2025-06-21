# 레시피 앱 프론트엔드 개발 가이드라인

## 프로젝트 개요 (Project Overview)

레시피 앱은 사용자의 식재료를 효율적으로 관리하고 유통기한을 추적하는 모바일 애플리케이션입니다. 
주요 기능으로는 식재료 관리, 영수증/식재료 이미지 인식을 통한 자동 등록, 개별 식재료 유통기한 알림 등이 있습니다.

### 실제 기술 스택 (Current Tech Stack)
- **코어**: React Native 0.79.3 + Expo SDK 53, TypeScript 5.8.3
- **상태 관리**: Zustand 4.5.2 (전역 상태)
- **서버 상태**: @tanstack/react-query 5.28.0 (서버 데이터 캐싱 및 동기화)
- **네비게이션**: expo-router 5.0.7 (파일 기반 라우팅)
- **스타일링**: Styled Components 6.1.8
- **알림**: expo-notifications 0.31.3 + Firebase 10.8.0
- **이미지 처리**: expo-camera 16.1.7, expo-image-picker 16.1.4
- **성능 최적화**: @shopify/flash-list 1.7.6
- **드래그 앤 드롭**: react-native-draggable-flatlist 4.0.1
- **날짜 선택**: @react-native-community/datetimepicker 8.3.0
- **토스트**: react-native-toast-message 2.2.0
- **저장소**: @react-native-async-storage/async-storage 2.1.2
- **네트워크**: axios 1.6.7
- **기타**: react-native-gesture-handler, react-native-reanimated, react-native-safe-area-context

## 기능 요구사항 (Feature Requirements)

### 1. 실제 화면 구조 (Actual Screen Structure)
#### 1.1 네비게이션 구조 - 실제 구현
- **Expo Router 파일 기반 라우팅** 사용
- **하단 탭 네비게이션** (4개 탭)
  - `src/app/(tabs)/index.tsx`: 홈 화면 (식재료 목록)
  - `src/app/(tabs)/add.tsx`: 추가 화면 (재료 추가)
  - `src/app/(tabs)/notifications.tsx`: 알림 화면 (알림 히스토리)
  - `src/app/(tabs)/settings.tsx`: 설정 화면 (알림 설정)
- **탭바 제어**: `useNavigationStore`를 통한 동적 활성화/비활성화

#### 1.2 실제 탭바 구현
```typescript
// src/app/(tabs)/_layout.tsx
- @expo/vector-icons/Feather 아이콘 사용
- SafeArea 지원 (react-native-safe-area-context)
- 그림자 및 elevation 효과
- 탭바 높이: 50pt + SafeArea
- 동적 표시/숨김 기능 (Zustand 스토어 제어)
```

### 2. 식재료 관리 - 실제 구현
#### 2.1 홈 화면 기능 (`src/app/(tabs)/index.tsx`)
- **@shopify/flash-list**를 사용한 성능 최적화된 목록
- **실시간 검색**: `SearchBar` 컴포넌트
- **필터링**: 
  - 보관 방법별 (실온/냉장/냉동) - `StorageTypeSelector`
  - 카테고리별 (전체, 채소, 과일, 육류, 수산물, 유제품, 기타) - `CategorySelector`
- **정렬**: created_at DESC (최신 순)
- **유통기한 임박 알림**: `ExpiryAlert` 컴포넌트 (horizontal ScrollView)
- **선택 모드**: 다중 선택 후 일괄 삭제
- **개별 수정**: 모달 형태의 `EditIngredientForm`

#### 2.2 실제 데이터 구조
```typescript
// src/types/api.ts
export type Ingredient = {
  id: number;
  name: string;
  quantity: number;
  storage_type: 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN';
  expiry_date: string; // ISO 날짜 문자열
  category: string;
  default_expiry_days: number;
  user_id?: number;
  created_at: string;
  updated_at: string;
};
```

### 3. 재료 추가 - 실제 구현
#### 3.1 추가 화면 구조 (`src/app/(tabs)/add.tsx`)
- **SegmentedControl**로 모드 전환
  - 단일 추가 모드 (`SingleMode`)
  - 다중 추가 모드 (`BulkMode`)
- **모드별 컴포넌트 분리**:
  - `AddIngredientForm/SingleMode/index.tsx`
  - `AddIngredientForm/BulkMode/index.tsx`
  - `AddIngredientForm/index.tsx` (메인 컨테이너)

#### 3.2 단일 모드 - 실제 구현
- **기본 정보 입력**:
  - `name`: 텍스트 입력
  - `category`: `CategorySelector` 컴포넌트
  - `storage_type`: `StorageTypeSelector` (3개 버튼 그룹)
  - `quantity`: 숫자 입력
  - `expiry_date`: `ExpiryDatePicker` (날짜 선택기 + 직접 입력)
- **이미지 인식**: `ImageRecognitionActions` 컴포넌트 (카메라/갤러리에서 이미지 선택 후 Vision API 호출)

#### 3.3 다중 모드 - 실제 구현
- **react-native-draggable-flatlist**를 사용한 드래그 앤 드롭 재정렬
- **BulkIngredientItem** 컴포넌트로 개별 항목 관리
- **일괄 추가**: 모든 항목을 한 번에 서버에 전송
- **영수증 스캔**: `ReceiptFlow` 컴포넌트 통합

### 4. 영수증 처리 플로우 - 실제 구현
#### 4.1 ReceiptFlow 컴포넌트 구조
```typescript
// src/components/ingredients/ReceiptFlow/index.tsx
- 전체 플로우를 관리하는 컨테이너
- 단계별 화면 전환 관리 (SCAN → REVIEW → EDIT → SAVE)
- 탭바 제어 (처리 중 비활성화)

// 하위 컴포넌트들:
- ReceiptScanner/index.tsx: expo-camera 촬영 및 이미지 선택
- ReceiptResult/index.tsx: OCR 결과 표시 및 편집
```

#### 4.2 실제 이미지 처리 플로우
1. **카메라 촬영 또는 갤러리 선택** (expo-image-picker)
2. **서버 OCR API 호출** (`/api/v1/ocr/receipt`)
3. **식재료 필터링된 결과 수신**
4. **사용자 편집 가능** (항목 선택/해제, 정보 수정)
5. **최종 저장** (개별 식재료로 변환)

### 5. 상태 관리 - 실제 구현
#### 5.1 Zustand 스토어 구조
```typescript
// src/stores/navigation.ts
- isTabBarEnabled: 탭바 활성화 상태
- disableTabBar/enableTabBar: 제어 함수

// src/stores/notification.ts  
- FCM 토큰 관리
- 알림 설정 상태
- 서버와의 동기화

// src/stores/receipt.ts
- 영수증 처리 상태 관리
- 단계별 플로우 제어
- 모드 전환 모달 상태
```

#### 5.2 React Query 사용
```typescript
// src/hooks/query/useIngredients.ts
- useIngredients: 목록 조회
- useCreateIngredient: 생성
- useUpdateIngredient: 수정  
- useDeleteIngredient: 삭제
- React Query 캐싱으로 오프라인 지원
- 자동 재시도 및 백그라운드 업데이트
```

### 6. 알림 시스템 - 실제 구현
#### 6.1 FCM 통합
```typescript
// src/hooks/useFCMToken.ts
- FCM 토큰 자동 생성 및 등록
- 서버 토큰 등록 관리
- 권한 요청 처리

// src/hooks/usePushNotifications.ts  
- 포그라운드/백그라운드 알림 처리
- 알림 클릭 시 액션 처리

// src/hooks/useExpiryNotification.ts
- 유통기한 기반 로컬 알림 스케줄링
- 3일 이하 식재료 감지 및 알림

// src/hooks/useLocalExpiryNotification.ts
- expo-notifications를 사용한 로컬 알림
- 개발 환경에서의 알림 테스트
```

#### 6.2 설정 화면 - 실제 구현
```typescript
// src/app/(tabs)/settings.tsx
- 알림 시간 설정 (@react-native-community/datetimepicker)
- 요일별 알림 설정 (7개 토글 버튼)
- FCM 토큰 상태 표시
- 개발 모드 전용 기능:
  * 테스트 알림 전송
  * 에러 로그 테스트
  * FCM 토큰 디버깅 정보
  * 캐시 상태 표시
```

## 관련 코드 (Relevant Codes)

### 실제 디렉토리 구조 (Current Directory Structure)
```
client/src/
├── app/                          # Expo Router 라우팅
│   ├── _layout.tsx              # 루트 레이아웃 (QueryClient, FCM 초기화)
│   └── (tabs)/                  # 탭 네비게이션 그룹
│       ├── _layout.tsx          # 탭 레이아웃 (Feather 아이콘, SafeArea)
│       ├── index.tsx            # 홈 (FlashList, 검색, 필터)
│       ├── add.tsx              # 추가 (SegmentedControl, 모드 전환)
│       ├── notifications.tsx    # 알림 히스토리
│       └── settings.tsx         # 설정 (알림, FCM, 개발자 도구)
├── components/
│   ├── AppInitializer.tsx       # 앱 초기화 (에러 핸들러, FCM)
│   ├── common/                  # 공통 컴포넌트
│   │   ├── Button/              # 재사용 버튼
│   │   │   └── index.tsx
│   │   └── SegmentedControl/    # iOS 스타일 세그먼트
│   │       └── index.tsx
│   └── ingredients/             # 식재료 관련 컴포넌트
│       ├── AddIngredientForm/   # 추가 폼
│       │   ├── BulkMode/        # 다중 모드
│       │   │   ├── index.tsx    # 메인 다중 모드 컴포넌트
│       │   │   └── BulkIngredientItem.tsx # 개별 항목
│       │   ├── SingleMode/      # 단일 모드
│       │   │   └── index.tsx
│       │   ├── index.tsx        # 메인 폼 컨테이너
│       │   └── ImageRecognitionActions.tsx # 이미지 인식
│       ├── IngredientCard/      # 목록 아이템
│       │   ├── index.tsx        # 메인 카드 컴포넌트
│       │   ├── styles.ts        # Styled Components
│       │   └── types.ts         # 카드 타입 정의
│       ├── StorageTypeSelector/ # 보관 방법 선택 (3버튼 그룹)
│       │   └── index.tsx
│       ├── ReceiptFlow/         # 영수증 처리 플로우
│       │   └── index.tsx
│       ├── ReceiptScanner/      # 카메라/갤러리
│       │   └── index.tsx
│       ├── ReceiptResult/       # OCR 결과 편집
│       │   └── index.tsx
│       ├── CategorySelector.tsx # 카테고리 선택 (드롭다운)
│       ├── ExpiryDatePicker.tsx # 날짜 선택 (입력+picker)
│       ├── SearchBar.tsx        # 검색 입력
│       ├── ExpiryAlert.tsx      # 유통기한 임박 알림 (horizontal scroll)
│       └── EditIngredientForm.tsx # 수정 폼 (모달)
├── hooks/
│   ├── query/                   # React Query 훅
│   │   └── useIngredients.ts    # CRUD 작업
│   ├── useFCMToken.ts          # FCM 토큰 관리
│   ├── usePushNotifications.ts # 푸시 알림 처리
│   ├── useExpiryNotification.ts # 유통기한 알림
│   ├── useLocalExpiryNotification.ts # 로컬 알림
│   ├── useIngredientsCache.ts  # 캐시 관리
│   ├── useErrorHandler.ts      # 전역 에러 처리
│   └── useSafeAreaStyle.ts     # SafeArea 스타일링
├── services/api/               # API 클라이언트
│   ├── client.ts               # Axios 기본 설정 + 인터셉터
│   ├── ingredients.ts          # 식재료 API
│   ├── notifications.ts        # 알림 API
│   ├── notificationLog.ts      # 알림 로그 API
│   ├── ocr.ts                  # OCR API
│   └── vision.ts               # 이미지 인식 API
├── stores/                     # Zustand 상태 관리
│   ├── navigation.ts           # 탭바 제어
│   ├── notification.ts         # FCM 토큰, 알림 설정
│   └── receipt.ts              # 영수증 플로우
├── types/                      # TypeScript 타입
│   ├── api.ts                  # API 관련 타입
│   ├── env.d.ts                # 환경 변수 타입
│   └── global.d.ts             # 전역 타입
└── config/                     # 설정 파일
    ├── env.ts                  # 환경 변수 관리 (EnvConfig 클래스)
    └── firebase.ts             # Firebase 설정
```

### 실제 컴포넌트 구조 (Current Component Structure)

#### 1. 홈 화면 컴포넌트 구조
```typescript
// src/app/(tabs)/index.tsx
export default function HomeScreen() {
  // @shopify/flash-list로 성능 최적화
  // 검색, 필터링, 정렬 로직
  // 선택 모드 (다중 삭제)
  // 수정 모달 관리
  // useIngredients() React Query 훅 사용
}

// 사용하는 주요 컴포넌트:
- SearchBar: 실시간 검색
- ExpiryAlert: 유통기한 임박 알림 (horizontal scroll)
- IngredientCard: 개별 아이템 (선택 모드 지원)
- EditIngredientForm: 수정 모달
```

#### 2. 추가 화면 컴포넌트 구조  
```typescript
// src/app/(tabs)/add.tsx
export default function AddScreen() {
  // SegmentedControl로 모드 전환
  // 모드별 컴포넌트 렌더링
}

// AddIngredientForm/index.tsx
// 모드에 따라 SingleMode 또는 BulkMode 렌더링

// SingleMode/index.tsx
- 기본 정보 입력 폼
- ImageRecognitionActions 컴포넌트
- 모드 전환 제안 로직

// BulkMode/index.tsx  
- react-native-draggable-flatlist 항목 관리
- 영수증 스캔 플로우 통합
- 일괄 추가 처리
```

#### 3. 영수증 처리 컴포넌트 구조
```typescript
// ReceiptFlow/index.tsx
- 전체 플로우 관리 (SCAN → REVIEW → EDIT → SAVE)
- 탭바 제어 (processing 중 비활성화)
- 단계별 컴포넌트 렌더링

// ReceiptScanner/index.tsx
- expo-camera CameraView 컴포넌트 사용
- 카메라 권한 처리
- expo-image-picker 갤러리 이미지 선택
- OCR API 호출

// ReceiptResult/index.tsx
- OCR 결과 표시
- 항목별 선택/해제
- 정보 편집 기능
- 최종 저장 처리
```

## 규칙 (Rules)

### 1. 실제 컴포넌트 작성 규칙

#### 1.1 파일 구조 - 실제 구현 패턴
```typescript
// 단순 컴포넌트 (파일 하나)
src/components/ingredients/CategorySelector.tsx
src/components/ingredients/SearchBar.tsx
src/components/ingredients/ExpiryAlert.tsx
src/components/ingredients/EditIngredientForm.tsx

// 복잡한 컴포넌트 (폴더 구조)
src/components/ingredients/IngredientCard/
├── index.tsx        # 메인 컴포넌트
├── styles.ts        # Styled Components
└── types.ts         # 타입 정의

src/components/ingredients/StorageTypeSelector/
├── index.tsx        # 메인 컴포넌트  
└── (스타일은 인라인으로 처리)
```

#### 1.2 실제 스타일링 패턴
```typescript
// 1. Styled Components 사용 (IngredientCard)
import styled from 'styled-components/native';

export const Container = styled.View<{ isSelected: boolean }>`
  background-color: ${props => props.isSelected ? '#e6f0ff' : '#fff'};
  border-radius: 8px;
  padding: 16px;
  margin: 8px;
`;

// 2. StyleSheet 사용 (대부분의 컴포넌트)
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
});

// 3. 인라인 스타일 (동적 스타일링)
<View style={[
  styles.container,
  isSelected && { backgroundColor: '#e6f0ff' }
]} />
```

### 2. 실제 상태 관리 패턴

#### 2.1 Zustand 스토어 작성 패턴
```typescript
// src/stores/navigation.ts - 실제 구현
import { create } from 'zustand';

type NavigationState = {
  isTabBarEnabled: boolean;
};

type NavigationActions = {
  disableTabBar: () => void;
  enableTabBar: () => void;
};

export const useNavigationStore = create<NavigationState & NavigationActions>((set) => ({
  isTabBarEnabled: true,
  disableTabBar: () => set({ isTabBarEnabled: false }),
  enableTabBar: () => set({ isTabBarEnabled: true }),
}));
```

#### 2.2 React Query 훅 패턴
```typescript
// src/hooks/query/useIngredients.ts - 실제 구현
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIngredients, createIngredient } from '@/services/api/ingredients';

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });
};

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};
```

### 3. 실제 API 통신 규칙

#### 3.1 API 클라이언트 구조
```typescript
// src/services/api/client.ts - 실제 구현
import axios from 'axios';
import EnvConfig from '@/config/env';

export const apiClient = axios.create({
  baseURL: EnvConfig.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터로 success 필드 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답 성공: ${response.status}`);
    return response.data;
  },
  (error) => {
    console.error('❌ API 응답 오류:', error);
    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.message || '알 수 없는 오류가 발생했습니다.',
    });
  }
);
```

#### 3.2 실제 API 서비스 패턴
```typescript
// src/services/api/ingredients.ts - 실제 구현
import { apiClient } from './client';
import type { Ingredient } from '@/types/api';

export const getIngredients = async (): Promise<Ingredient[]> => {
  const res = await apiClient.get('/ingredients');
  return res.data;
};

export const createIngredient = async (
  ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>
): Promise<Ingredient> => {
  console.log('[재료 추가 요청]', ingredient);
  const res = await apiClient.post('/ingredients', ingredient);
  return res.data;
};
```

### 4. 실제 성능 최적화 규칙

#### 4.1 FlashList 사용법
```typescript
// src/app/(tabs)/index.tsx - 실제 구현
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={filteredIngredients}
  extraData={{ isSelectionMode, selectedIds }}
  renderItem={({ item }) => (
    <IngredientCard
      ingredient={item}
      selectionMode={isSelectionMode}
      selected={selectedIds.includes(item.id)}
      onSelect={() => toggleSelectIngredient(item.id)}
      onEdit={() => handleEditIngredient(item)}
    />
  )}
  keyExtractor={item => String(item.id)}
  estimatedItemSize={100}
  contentContainerStyle={styles.listContent}
/>
```

#### 4.2 드래그 앤 드롭 최적화
```typescript
// BulkMode/index.tsx - 실제 구현
import DraggableFlatList from 'react-native-draggable-flatlist';

<DraggableFlatList<BulkFormData>
  data={items}
  renderItem={({ item, drag, isActive }) => (
    <BulkIngredientItem
      item={item}
      onDrag={drag}
      isActive={isActive}
      onUpdate={(updatedItem) => updateItem(item.id, updatedItem)}
      onRemove={() => removeItem(item.id)}
    />
  )}
  keyExtractor={(item, index) => index.toString()}
  onDragEnd={({ data }) => setItems(data)}
/>
```

### 5. 실제 에러 처리 규칙

#### 5.1 전역 에러 핸들러
```typescript
// src/hooks/useErrorHandler.ts - 실제 구현
import { useEffect } from 'react';
import { apiClient } from '@/services/api/client';

export const useErrorHandler = () => {
  useEffect(() => {
    const handleError = (error: Error, isFatal?: boolean) => {
      console.error('전역 에러:', error);
      
      // 서버로 에러 로그 전송
      logError(error, 'global', isFatal);
    };

    // React Native 전역 에러 핸들러 등록
    if (typeof ErrorUtils !== 'undefined') {
      ErrorUtils.setGlobalHandler(handleError);
    }
  }, []);
};

// 서버 에러 로그 전송
const logError = async (error: Error, context: string, isFatal?: boolean) => {
  try {
    await apiClient.post('/error-log', {
      message: error.message,
      stack: error.stack,
      context,
      isFatal: isFatal || false,
      timestamp: new Date().toISOString(),
      userAgent: navigator?.userAgent || 'React Native',
    });
  } catch (logError) {
    console.error('에러 로그 전송 실패:', logError);
  }
};
```

### 6. 실제 알림 처리 규칙

#### 6.1 FCM 토큰 관리
```typescript
// src/hooks/useFCMToken.ts - 실제 구현
import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification';
import { requestUserPermission, getFCMToken } from '@/config/firebase';

export const useFCMToken = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { fcmToken, setFCMToken, registerTokenWithServer } = useNotificationStore();

  const initializeFCMToken = async () => {
    try {
      // 알림 권한 요청
      const hasPermission = await requestUserPermission();
      if (!hasPermission) {
        console.log('알림 권한이 거부되었습니다.');
        return;
      }

      // FCM 토큰 생성
      const token = await getFCMToken();
      if (token) {
        setFCMToken(token);
        await registerTokenWithServer(token);
        setIsInitialized(true);
        console.log('✅ FCM 토큰 초기화 완료');
      }
    } catch (error) {
      console.error('❌ FCM 토큰 초기화 실패:', error);
    }
  };

  useEffect(() => {
    initializeFCMToken();
  }, []);

  return { fcmToken, isInitialized };
};
```

#### 6.2 로컬 알림 처리
```typescript
// src/hooks/useLocalExpiryNotification.ts - 실제 구현
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useIngredients } from '@/hooks/query/useIngredients';

export const useLocalExpiryNotification = () => {
  const { data: ingredients } = useIngredients();

  const scheduleExpiryNotifications = async () => {
    // 기존 알림 취소
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!ingredients) return;

    const today = new Date();
    
    ingredients.forEach(async (ingredient) => {
      if (!ingredient.expiry_date) return;

      const expiryDate = new Date(ingredient.expiry_date);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 3일 이하 남은 경우 알림 스케줄링
      if (daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '유통기한 임박 알림',
            body: `${ingredient.name}의 유통기한이 ${daysUntilExpiry}일 남았습니다.`,
            data: { ingredientId: ingredient.id },
          },
          trigger: {
            hour: 9,
            minute: 0,
            repeats: true,
          },
        });
      }
    });
  };

  useEffect(() => {
    scheduleExpiryNotifications();
  }, [ingredients]);
};
```

### 7. 실제 개발 환경 처리

#### 7.1 환경별 설정
```typescript
// src/config/env.ts - 실제 구현
import Constants from 'expo-constants';

class EnvConfig {
  static get API_BASE_URL(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    const developmentUrl = 'http://172.20.10.2:3000/api/v1';
    const defaultUrl = 'http://localhost:3000/api/v1';
    
    if (__DEV__) {
      return envUrl || developmentUrl;
    }
    
    return envUrl || defaultUrl;
  }

  static get FIREBASE_CONFIG() {
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA4CotimuGNCfppbfONHM3VaAOIccyzfpM',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'cookingingredientmanager.firebaseapp.com',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'cookingingredientmanager',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'cookingingredientmanager.firebasestorage.app',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '981367162693',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:981367162693:android:6c7e013bd64146ecc9a02c',
    };
  }

  static get DEBUG_MODE(): boolean {
    return process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || __DEV__;
  }
}

export default EnvConfig;
```

#### 7.2 개발 모드 전용 기능
```typescript
// src/app/(tabs)/settings.tsx - 실제 구현
const DevelopmentModeSection = () => {
  if (!__DEV__) return null;
  
  return (
    <View style={styles.developmentSection}>
      <Text style={styles.sectionTitle}>🧪 개발 모드</Text>
      
      <View style={styles.developmentNotice}>
        <Text style={styles.developmentText}>
          • Expo Go에서는 푸시 알림이 제한됩니다{'\n'}
          • 로컬 알림만 작동합니다{'\n'}
          • 실제 푸시 알림은 빌드된 앱에서만 가능합니다
        </Text>
      </View>

      <Button
        title="테스트 알림 전송"
        onPress={handleSendTestNotification}
        style={styles.testButton}
      />
      
      <Button
        title="에러 로그 테스트"
        onPress={handleTestErrorLog}
        style={styles.testButton}
      />
      
      <View style={styles.cacheInfo}>
        <Text style={styles.cacheTitle}>캐시 상태</Text>
        <Text style={styles.cacheText}>
          식재료: {ingredientsData?.length || 0}개{'\n'}
          캐시 시간: {lastFetchTime ? new Date(lastFetchTime).toLocaleString() : '없음'}
        </Text>
      </View>
    </View>
  );
};
```

### 8. 실제 캐시 관리

#### 8.1 React Query 캐시 설정
```typescript
// src/app/_layout.tsx - 실제 구현
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30, // 30분 (구 cacheTime)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### 8.2 캐시 상태 확인
```typescript
// src/hooks/useIngredientsCache.ts - 실제 구현
import { useQueryClient } from '@tanstack/react-query';

export const useIngredientsCache = () => {
  const queryClient = useQueryClient();
  
  const getCacheInfo = () => {
    const queryCache = queryClient.getQueryCache();
    const ingredientsQuery = queryCache.find(['ingredients']);
    
    return {
      isCached: !!ingredientsQuery,
      lastFetchTime: ingredientsQuery?.state.dataUpdatedAt,
      isStale: ingredientsQuery?.isStale(),
      data: ingredientsQuery?.state.data,
    };
  };
  
  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: ['ingredients'] });
  };
  
  const clearCache = () => {
    queryClient.removeQueries({ queryKey: ['ingredients'] });
  };
  
  return {
    getCacheInfo,
    invalidateCache,
    clearCache,
  };
};
```

## 개발 환경 제약사항

### Expo Go 제한사항
- **푸시 알림**: Expo Go에서는 Firebase 푸시 알림 수신 불가
- **로컬 알림만 가능**: expo-notifications의 로컬 알림만 작동
- **실제 푸시 알림**: EAS Build로 빌드된 앱에서만 가능

### 권장 개발 환경
- **로컬 개발**: Expo Go + 로컬 알림 테스트
- **푸시 알림 테스트**: EAS Build Development Build 사용
- **배포**: EAS Build Production Build

이 문서는 실제 구현된 코드를 기반으로 작성되었으며, 향후 개발 시 이 구조와 패턴을 따라 진행하시기 바랍니다. 