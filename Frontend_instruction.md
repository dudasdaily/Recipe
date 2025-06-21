# 레시피 앱 프론트엔드 개발 가이드라인

## 프로젝트 개요 (Project Overview)

레시피 앱은 사용자의 식재료를 효율적으로 관리하고 유통기한을 추적하는 모바일 애플리케이션입니다. 
주요 기능으로는 식재료 관리, 영수증/식재료 이미지 인식을 통한 자동 등록, 개별 식재료 유통기한 알림 등이 있습니다.

### 실제 기술 스택 (Current Tech Stack)
- **코어**: React Native 0.79.3 + Expo SDK 53
- **언어**: TypeScript 5.8.3
- **상태 관리**: Zustand 4.5.2 (전역 상태)
- **서버 상태**: @tanstack/react-query 5.28.0 (서버 데이터 캐싱)
- **네비게이션**: expo-router 5.0.7 (파일 기반 라우팅)
- **스타일링**: Styled Components 6.1.8
- **알림**: expo-notifications 0.31.3 + Firebase 10.8.0
- **이미지 처리**: expo-camera 16.1.7, expo-image-picker 16.1.4
- **리스트 컴포넌트**: @shopify/flash-list 1.7.6
- **드래그 앤 드롭**: react-native-draggable-flatlist 4.0.1
- **UI 컴포넌트**: react-native-modal-datetime-picker 18.0.0
- **기타**: react-native-safe-area-context, react-native-toast-message

## 기능 요구사항 (Feature Requirements)

### 1. 실제 화면 구조 (Actual Screen Structure)
#### 1.1 네비게이션 구조 - 실제 구현
- **Expo Router 파일 기반 라우팅** 사용
- **하단 탭 네비게이션** (4개 탭)
  - `app/(tabs)/index.tsx`: 홈 화면 (식재료 목록)
  - `app/(tabs)/add.tsx`: 추가 화면 (재료 추가)
  - `app/(tabs)/notifications.tsx`: 알림 화면 (알림 히스토리)
  - `app/(tabs)/settings.tsx`: 설정 화면 (알림 설정)
- **탭바 제어**: `useNavigationStore`를 통한 동적 활성화/비활성화

#### 1.2 실제 탭바 구현
```typescript
// app/(tabs)/_layout.tsx
- Feather 아이콘 사용
- SafeArea 지원 (insets.bottom 적용)
- 그림자 및 elevation 효과
- 탭바 높이: 50pt + SafeArea
- 동적 표시/숨김 기능 (스토어 제어)
```

### 2. 식재료 관리 - 실제 구현
#### 2.1 홈 화면 기능 (`app/(tabs)/index.tsx`)
- **FlashList**를 사용한 성능 최적화된 목록
- **실시간 검색**: `SearchBar` 컴포넌트
- **필터링**: 
  - 보관 방법별 (실온/냉장/냉동)
  - 카테고리별 (전체, 채소, 과일, 육류, 수산물, 유제품, 기타)
- **정렬**: created_at DESC (최신 순)
- **유통기한 임박 알림**: `ExpiryAlert` 컴포넌트
- **선택 모드**: 다중 선택 후 일괄 삭제
- **개별 수정**: 모달 형태의 `EditIngredientForm`

#### 2.2 실제 데이터 구조
```typescript
// types/api.ts
export type Ingredient = {
  id: number;
  name: string;
  quantity: number;
  storage_type: 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN';
  expiry_date: string; // ISO 날짜 문자열
  category: string;
  default_expiry_days: number;
  created_at: string;
  updated_at: string;
};
```

### 3. 재료 추가 - 실제 구현
#### 3.1 추가 화면 구조 (`app/(tabs)/add.tsx`)
- **SegmentedControl**로 모드 전환
  - 단일 추가 모드 (`SingleMode`)
  - 다중 추가 모드 (`BulkMode`)
- **모드별 컴포넌트 분리**:
  - `AddIngredientForm/SingleMode/`
  - `AddIngredientForm/BulkMode/`

#### 3.2 단일 모드 - 실제 구현
- **기본 정보 입력**:
  - `name`: 텍스트 입력
  - `category`: `CategorySelector` 컴포넌트
  - `storage_type`: `StorageTypeSelector` (3개 버튼 그룹)
  - `quantity`: 숫자 입력
  - `expiry_date`: `ExpiryDatePicker` (날짜 선택기 + 직접 입력)
- **이미지 인식**: 카메라/갤러리에서 이미지 선택 후 Vision API 호출

#### 3.3 다중 모드 - 실제 구현
- **DraggableFlatList**를 사용한 드래그 앤 드롭 재정렬
- **BulkIngredientItem** 컴포넌트로 개별 항목 관리
- **일괄 추가**: 모든 항목을 한 번에 서버에 전송
- **영수증 스캔**: `ReceiptFlow` 컴포넌트 통합

### 4. 영수증 처리 플로우 - 실제 구현
#### 4.1 ReceiptFlow 컴포넌트 구조
```typescript
// components/ingredients/ReceiptFlow/
- 전체 플로우를 관리하는 컨테이너
- 단계별 화면 전환 관리
- 탭바 제어 (처리 중 비활성화)

// 하위 컴포넌트들:
- ReceiptScanner/: 카메라 촬영 및 이미지 선택
- ReceiptResult/: OCR 결과 표시 및 편집
```

#### 4.2 실제 이미지 처리 플로우
1. **카메라 촬영 또는 갤러리 선택**
2. **서버 OCR API 호출** (`/api/v1/ocr/receipt`)
3. **식재료 필터링된 결과 수신**
4. **사용자 편집 가능** (항목 선택/해제, 정보 수정)
5. **최종 저장** (개별 식재료로 변환)

### 5. 상태 관리 - 실제 구현
#### 5.1 Zustand 스토어 구조
```typescript
// stores/navigation.ts
- isTabBarEnabled: 탭바 활성화 상태
- disableTabBar/enableTabBar: 제어 함수

// stores/notification.ts  
- FCM 토큰 관리
- 알림 설정 상태
- 서버와의 동기화

// stores/receipt.ts
- 영수증 처리 상태 관리
- 단계별 플로우 제어
- 모드 전환 모달 상태
```

#### 5.2 React Query 사용
```typescript
// hooks/query/useIngredients.ts
- useIngredients: 목록 조회
- useCreateIngredient: 생성
- useUpdateIngredient: 수정  
- useDeleteIngredient: 삭제
- React Query 캐싱으로 오프라인 지원
```

### 6. 알림 시스템 - 실제 구현
#### 6.1 FCM 통합
```typescript
// hooks/useFCMToken.ts
- FCM 토큰 자동 생성 및 등록
- 서버 토큰 등록 관리
- 권한 요청 처리

// hooks/usePushNotifications.ts  
- 포그라운드/백그라운드 알림 처리
- 알림 클릭 시 액션 처리

// hooks/useExpiryNotification.ts
- 유통기한 기반 로컬 알림 스케줄링
- 3일 이하 식재료 감지 및 알림
```

#### 6.2 설정 화면 - 실제 구현
```typescript
// app/(tabs)/settings.tsx
- 알림 시간 설정 (DateTimePicker)
- 요일별 알림 설정 (7개 토글 버튼)
- FCM 토큰 상태 표시
- 개발 모드 전용 기능:
  * 테스트 알림 전송
  * 에러 로그 테스트
  * FCM 토큰 디버깅 정보
```

## 관련 코드 (Relevant Codes)

### 실제 디렉토리 구조 (Current Directory Structure)
```
client/src/
├── app/                          # Expo Router 라우팅
│   ├── _layout.tsx              # 루트 레이아웃 (QueryClient, FCM 초기화)
│   └── (tabs)/                  # 탭 네비게이션 그룹
│       ├── _layout.tsx          # 탭 레이아웃 (Feather 아이콘)
│       ├── index.tsx            # 홈 (FlashList, 검색, 필터)
│       ├── add.tsx              # 추가 (SegmentedControl, 모드 전환)
│       ├── notifications.tsx    # 알림 히스토리
│       └── settings.tsx         # 설정 (알림, FCM, 개발자 도구)
├── components/
│   ├── common/                  # 공통 컴포넌트
│   │   ├── Button/              # 재사용 버튼
│   │   └── SegmentedControl/    # iOS 스타일 세그먼트
│   └── ingredients/             # 식재료 관련 컴포넌트
│       ├── AddIngredientForm/   # 추가 폼
│       │   ├── BulkMode/        # 다중 모드 (DraggableFlatList)
│       │   └── SingleMode/      # 단일 모드
│       ├── IngredientCard/      # 목록 아이템 (압축/확장 지원)
│       ├── CategorySelector.tsx # 카테고리 선택
│       ├── StorageTypeSelector/ # 보관 방법 (3버튼 그룹)
│       ├── ExpiryDatePicker.tsx # 날짜 선택 (입력+picker)
│       ├── SearchBar.tsx        # 검색 입력
│       ├── ExpiryAlert.tsx      # 유통기한 임박 알림
│       ├── EditIngredientForm.tsx # 수정 폼 (모달)
│       ├── ReceiptFlow/         # 영수증 처리 플로우
│       ├── ReceiptScanner/      # 카메라/갤러리 촬영
│       └── ReceiptResult/       # OCR 결과 편집
├── hooks/
│   ├── query/                   # React Query 훅
│   │   └── useIngredients.ts    # CRUD 작업
│   ├── useFCMToken.ts          # FCM 토큰 관리
│   ├── usePushNotifications.ts # 푸시 알림 처리
│   ├── useExpiryNotification.ts # 유통기한 알림
│   ├── useErrorHandler.ts      # 전역 에러 처리
│   └── useSafeAreaStyle.ts     # SafeArea 스타일링
├── services/api/               # API 클라이언트
│   ├── client.ts               # Axios 기본 설정
│   ├── ingredients.ts          # 식재료 API
│   ├── notifications.ts        # 알림 API
│   ├── ocr.ts                  # OCR API
│   └── vision.ts               # 이미지 인식 API
├── stores/                     # Zustand 상태 관리
│   ├── navigation.ts           # 탭바 제어
│   ├── notification.ts         # FCM 상태
│   └── receipt.ts              # 영수증 플로우
├── types/                      # TypeScript 타입
│   ├── api.ts                  # API 관련 타입
│   ├── env.d.ts                # 환경 변수 타입
│   └── global.d.ts             # 전역 타입
└── config/                     # 설정 파일
    ├── env.ts                  # 환경 변수 관리
    └── firebase.ts             # Firebase 설정
```

### 실제 컴포넌트 구조 (Current Component Structure)

#### 1. 홈 화면 컴포넌트 구조
```typescript
// app/(tabs)/index.tsx
export default function HomeScreen() {
  // FlashList로 성능 최적화
  // 검색, 필터링, 정렬 로직
  // 선택 모드 (다중 삭제)
  // 수정 모달 관리
}

// 사용하는 주요 컴포넌트:
- SearchBar: 실시간 검색
- ExpiryAlert: 유통기한 임박 알림 (horizontal scroll)
- IngredientCard: 개별 아이템 (선택 모드 지원)
- EditIngredientForm: 수정 모달
```

#### 2. 추가 화면 컴포넌트 구조  
```typescript
// app/(tabs)/add.tsx
export default function AddScreen() {
  // SegmentedControl로 모드 전환
  // 모드별 컴포넌트 렌더링
}

// AddIngredientForm/index.tsx
// 모드에 따라 SingleMode 또는 BulkMode 렌더링

// SingleMode/index.tsx
- 기본 정보 입력 폼
- 이미지 인식 버튼
- 모드 전환 제안 로직

// BulkMode/index.tsx  
- DraggableFlatList 항목 관리
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
- CameraView 컴포넌트 사용
- 카메라 권한 처리
- 갤러리 이미지 선택
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
components/ingredients/CategorySelector.tsx
components/ingredients/SearchBar.tsx
components/ingredients/ExpiryAlert.tsx
components/ingredients/EditIngredientForm.tsx

// 복잡한 컴포넌트 (폴더 구조)
components/ingredients/IngredientCard/
├── index.tsx        # 메인 컴포넌트
├── styles.ts        # Styled Components
└── types.ts         # 타입 정의

components/ingredients/StorageTypeSelector/
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
// stores/navigation.ts - 실제 구현
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
// hooks/query/useIngredients.ts - 실제 구현
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIngredients, createIngredient } from '@/services/api/ingredients';

export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
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
// services/api/client.ts - 실제 구현
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL + '/api/v1',
  timeout: 10000,
});

// 응답 인터셉터로 success 필드 처리
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success !== undefined) {
      if (response.data.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.data.message || 'API 오류');
      }
    }
    return response.data;
  },
  (error) => {
    console.error('API 오류:', error);
    throw error;
  }
);
```

#### 3.2 실제 API 서비스 패턴
```typescript
// services/api/ingredients.ts - 실제 구현
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
// app/(tabs)/index.tsx - 실제 구현
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={filteredIngredients}
  extraData={{ isSelectionMode, selectedIds }}
  renderItem={({ item }) => (
    <IngredientCard
      ingredient={item}
      selectionMode={isSelectionMode}
      selected={selectedIds.includes(item.id)}
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
    />
  )}
  keyExtractor={(item, index) => index.toString()}
  onDragEnd={({ data }) => setItems(data)}
/>
```

### 5. 실제 에러 처리 규칙

#### 5.1 전역 에러 핸들러
```typescript
// hooks/useErrorHandler.ts - 실제 구현
export const useErrorHandler = () => {
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('전역 에러:', error);
      // 서버로 에러 로그 전송
      logError(error, 'global');
    };

    // React Native 전역 에러 핸들러 등록
    ErrorUtils.setGlobalHandler(handleError);
  }, []);
};

// 서버 에러 로그 전송
const logError = async (error: Error, context: string) => {
  try {
    await apiClient.post('/error-log', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (logError) {
    console.error('에러 로그 전송 실패:', logError);
  }
};
```

### 6. 실제 알림 처리 규칙

#### 6.1 FCM 토큰 관리
```typescript
// hooks/useFCMToken.ts - 실제 구현
export const useFCMToken = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { fcmToken, setFCMToken, registerTokenWithServer } = useNotificationStore();

  const initializeFCMToken = async () => {
    // 알림 권한 요청
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    // FCM 토큰 생성
    const token = await getFCMToken();
    if (token) {
      setFCMToken(token);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initializeFCMToken();
  }, []);

  return { fcmToken, isInitialized };
};
```

### 7. 실제 개발 환경 처리

#### 7.1 환경별 설정
```typescript
// config/env.ts - 실제 구현
class EnvConfig {
  static get API_BASE_URL(): string {
    if (__DEV__) {
      return process.env.EXPO_PUBLIC_DEV_API_URL || 'http://localhost:3000';
    }
    return process.env.EXPO_PUBLIC_PROD_API_URL || 'https://api.recipe.app';
  }

  static get APP_NAME(): string {
    return process.env.EXPO_PUBLIC_APP_NAME || 'Recipe Manager';
  }
}
```

#### 7.2 개발 모드 전용 기능
```typescript
// app/(tabs)/settings.tsx - 실제 구현
const DevelopmentModeNotice = () => {
  if (!__DEV__) return null;
  
  return (
    <View style={styles.developmentNotice}>
      <Text style={styles.developmentTitle}>🧪 개발 모드</Text>
      <Text style={styles.developmentText}>
        • Expo Go에서는 푸시 알림이 제한됩니다{'\n'}
        • 로컬 알림만 작동합니다{'\n'}
        • 실제 푸시 알림은 빌드된 앱에서만 가능합니다
      </Text>
    </View>
  );
};
```

이 문서는 실제 구현된 코드를 기반으로 작성되었으며, 향후 개발 시 이 구조와 패턴을 따라 진행하시기 바랍니다. 