# 레시피 앱 프론트엔드 개발 가이드라인

## 프로젝트 개요 (Project Overview)

레시피 앱은 사용자의 식재료를 효율적으로 관리하고 유통기한을 추적하는 모바일 애플리케이션입니다. 
주요 기능으로는 식재료 관리, 영수증/식재료 이미지 인식을 통한 자동 등록, 개별 식재료 유통기한 알림 등이 있습니다.

### 기술 스택
- React Native / Expo SDK 53버전 이상
- TypeScript
- Zustand (상태 관리)
- React Query (서버 상태 관리)
- React Navigation (라우팅)
- Styled Components (스타일링)
- Firebase Cloud Messaging (푸시 알림)

## 기능 요구사항 (Feature Requirements)

### 1. 화면 구조
#### 1.1 공통 레이아웃
- 모든 화면에 하단 탭바 구현
  - 홈 탭: 식재료 목록 화면
  - 추가 탭: 재료 추가 화면
  - 설정 탭: 설정 화면
- 탭바 디자인
  - 아이콘과 텍스트 레이블 조합
  - 활성 탭 시각적 강조
  - 높이 50pt로 통일
  - 그림자 효과 적용
  - 각 화면의 하단에 고정 배치
  - 화면 전환 시에도 탭바 유지
- 탭바 네비게이션 제어
  - 기본적으로 모든 탭 간 자유로운 전환 가능
  - 모달이나 중요 작업 진행 중에는 탭 전환 제한
    - 다중 모드 전환 모달 표시 중
    - 데이터 저장/수정 중
    - 이미지 인식 처리 중
  - 제한 시 시각적/촉각적 피드백 제공
    - 탭 버튼 비활성화 스타일 적용
    - 탭 터치 시 진동 피드백
    - 안내 토스트 메시지 표시

#### 1.2 화면 구조
- 각 화면의 기본 레이아웃
  - 전체 높이: 100vh (viewport height)
  - 상단: 컨텐츠 영역 (flex-grow: 1)
  - 하단: 탭바 영역 (높이: 50pt)
- 컨텐츠 영역 스크롤
  - 컨텐츠가 화면을 벗어날 경우 스크롤 가능
  - 탭바는 항상 하단에 고정 (position: fixed)
  - 스크롤 시에도 탭바 가시성 유지
- 화면 전환 애니메이션
  - 탭 전환 시 부드러운 슬라이드 효과
  - 탭바는 애니메이션 없이 고정 유지

### 2. 식재료 관리
#### 2.1 기본 기능
- 식재료 목록 조회, 추가, 수정, 삭제
- 카테고리별 필터링 및 정렬
- 보관 방법별 분류 (실온/냉장/냉동)
  - 보관 방법은 상호 배타적 선택 UI로 구현
  - 선택된 옵션은 시각적으로 강조
- 유통기한 임박 식재료 하이라이트
- 오프라인 모드 지원을 위한 로컬 캐싱
- 스크롤 시에도 하단 탭바 유지

### 3. 재료 추가
#### 3.1 추가 방식 선택
- 단일 추가와 다중 추가 모드 전환 가능
  - 상단 세그먼트 컨트롤로 모드 전환
  - 각 모드별 적절한 입력 폼 표시
- 스크롤 처리
  - 전체 화면 스크롤 적용
  - 스크롤 시 세그먼트 컨트롤은 상단에 고정 (sticky)
  - 스크롤바 커스텀 스타일링
  - Pull-to-refresh 지원

#### 3.2 단일 재료 추가
- 기본 정보 입력
  - 재료명, 수량, 보관 방법, 유통기한
  - 키보드 표시 시 입력 필드가 가려지지 않도록 자동 스크롤
  - 입력 필드 간 Tab 키 이동 지원
- 이미지 인식 기능
  - 재료 사진 촬영 (단일 재료만 인식)
  - 영수증 촬영 시도 시 다중 모드 전환 안내
- 모드 전환 처리
  - 영수증이나 이미지에서 여러 재료가 인식될 경우:
    1. 자동으로 다중 모드 전환 제안 모달 표시
    2. 사용자가 전환 확인 시:
       - 다중 모드로 전환
       - 인식된 모든 재료가 자동으로 입력 폼에 추가됨
       - 각 재료별로 기본값 자동 설정 (보관 방법, 알림 등)
    3. 사용자가 전환 거부 시:
       - 단일 모드 유지
       - 첫 번째 인식된 재료만 입력 폼에 자동 입력
  - 모달을 통한 명확한 사용자 확인 절차
  - 전환 취소 시 단일 모드 유지
- 알림 설정
  - 개별 알림 활성화/비활성화
- 스크롤 인터랙션
  - 부드러운 스크롤 애니메이션
  - 스크롤 시 키보드 자동 닫기 옵션
  - 저장 버튼은 항상 화면 하단에 고정 (floating)

#### 3.3 다중 재료 추가
- 여러 재료를 한 번에 추가할 수 있는 기능
  - 재료 목록 형태로 UI 구성
  - 각 재료마다 개별 설정 가능 (보관 방법, 유통기한, 알림 등)
  - 임시 저장 및 불러오기 기능
- 이미지 인식 기능
  - 영수증 스캔을 통한 다중 재료 자동 인식
  - 재료 사진 촬영 (여러 재료 동시 인식 가능)
- 일괄 설정 기능
  - 선택된 재료들에 대한 일괄 보관 방법 설정
  - 선택된 재료들에 대한 일괄 알림 설정
- 드래그 앤 드롭으로 재료 순서 변경
- 재료 목록 템플릿 저장 및 불러오기
- 스크롤 및 드래그 앤 드롭 통합
  - 스크롤 중에도 드래그 앤 드롭 가능
  - 목록 끝에서 자동 스크롤 처리
  - 드래그 시 햅틱 피드백 제공
  - 드롭 영역 시각적 표시
- 성능 최적화
  - 가상화 스크롤 적용 (react-window)
  - 이미지 레이지 로딩
  - 스크롤 성능 최적화를 위한 메모이제이션

### 4. 이미지 인식
#### 4.1 영수증 스캔 (다중 모드 전용)
- 카메라를 통한 영수증 촬영
- OCR을 통한 텍스트 추출
- 자동 식재료 등록
  - 인식된 모든 재료는 자동으로 입력 폼에 추가
  - 각 재료별 기본 정보 자동 입력:
    - 재료명
    - 수량 및 단위
    - 기본 보관 방법 (설정에 따라)
    - 현재 날짜 기준 기본 유통기한
    - 기본 알림 설정
- 수동 수정 기능
  - 자동 입력된 각 재료 정보 개별 수정 가능
  - 불필요한 재료 삭제 가능
  - 누락된 재료 수동 추가 가능
- 영수증 히스토리 관리

#### 4.2 식재료 이미지 분석
- 카메라를 통한 식재료 촬영
  - 단일 모드: 한 번에 하나의 재료만 인식
  - 다중 모드: 여러 재료 동시 인식 가능
- Vision API를 통한 식재료 인식
- 인식된 식재료 자동 입력
  - 단일 모드:
    - 여러 재료 인식 시 모드 전환 제안
    - 전환 수락 시 모든 재료 자동 입력
    - 전환 거부 시 첫 번째 재료만 입력
  - 다중 모드:
    - 인식된 모든 재료 자동으로 입력 폼에 추가
    - 각 재료별 기본값 자동 설정
- 신뢰도 점수 표시
  - 각 인식 결과별 신뢰도 점수 표시
  - 낮은 신뢰도의 결과는 사용자 확인 필요 표시
- 수동 수정 기능
  - 자동 입력된 정보 수정
  - 잘못 인식된 재료 삭제
  - 추가 재료 수동 입력
- 모드 전환 처리
  - 단일 모드에서 여러 재료 인식 시:
    1. 자동 전환 제안 모달 표시
    2. 전환 수락 시:
       - 다중 모드로 전환
       - 모든 인식 결과 자동 입력
       - 각 재료별 기본 설정 적용
    3. 전환 거부 시:
       - 단일 모드 유지
       - 첫 번째 인식 결과만 사용

### 5. 알림 시스템
- 유통기한 임박 알림
  - 전역 알림 설정
    - 알림 수신 시간 (24시간 형식)
    - 알림 수신 요일 선택
    - 알림 활성화/비활성화
  - 개별 식재료 알림 설정
    - 식재료별 알림 활성화/비활성화
    - 식재료 추가 시 기본 알림 설정 옵션
- 알림 히스토리 관리
- FCM 토큰 관리

## 관련 코드 (Relevant Codes)

### 디렉토리 구조
```
client/
├── assets/              # 이미지, 폰트 등 정적 자원
├── src/
│   ├── app/            # 앱 라우팅 (expo-router)
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── services/      # API 통신 및 비즈니스 로직
│   │   ├── api/      # API 클라이언트
│   │   ├── fcm/      # Firebase 알림 관련
│   │   ├── vision/   # 이미지 분석 관련
│   │   └── storage/  # 로컬 스토리지 관리
│   ├── stores/        # 상태 관리
│   └── utils/         # 유틸리티 함수
└── types/             # 타입 정의
```

### 컴포넌트 구조
```
components/
├── common/           # 공통 컴포넌트
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Modal/      # 모드 전환 확인 모달 포함
│   ├── Toggle/      # 알림 토글 등
│   ├── TabBar/      # 하단 탭바
│   ├── ScrollView/  # 커스텀 스크롤뷰
│   └── DragList/    # 드래그 가능한 목록 컴포넌트
├── ingredients/      # 식재료 관련 컴포넌트
│   ├── IngredientCard/
│   ├── IngredientList/
│   ├── AddIngredientForm/
│   │   ├── SingleMode/   # 단일 재료 추가 모드
│   │   │   ├── ScrollContainer.tsx  # 스크롤 컨테이너
│   │   │   ├── ImageRecognition.tsx # 이미지 인식 컴포넌트
│   │   │   └── FloatingButton.tsx   # 플로팅 저장 버튼
│   │   └── BulkMode/     # 다중 재료 추가 모드
│   │       ├── VirtualizedList.tsx  # 가상화된 목록
│   │       └── DragDropContext.tsx  # 드래그 앤 드롭 컨텍스트
│   ├── StorageTypeSelector/ # 보관 방법 선택 컴포넌트
│   ├── BulkAddForm/        # 다중 재료 추가 폼
│   └── TemplateManager/    # 재료 목록 템플릿 관리
├── camera/          # 카메라 관련 컴포넌트
│   ├── CameraView/
│   ├── ReceiptScanner/
│   └── IngredientScanner/
└── settings/        # 설정 관련 컴포넌트
    ├── NotificationSettings/
    └── ProfileSettings/
```

## 규칙 (Rules)

### 1. 컴포넌트 작성 규칙

#### 1.1 컴포넌트 파일 구조
```typescript
// types.ts
export type StorageTypeSelectorProps = {
  value: 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN';
  onChange: (type: 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN') => void;
};

// styles.ts
import styled from 'styled-components/native';
import { colors, typography } from '@/styles/theme';

export const ButtonGroup = styled.View`
  flex-direction: row;
  gap: 10px;
`;

export const StorageButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  background-color: ${props => props.isSelected ? colors.gradient.start : colors.white};
  border-radius: 8px;
  padding: 12px;
  height: 44px;
  flex: 1;
  justify-content: center;
  align-items: center;
  ${props => !props.isSelected && `border: 1px solid ${colors.border};`}
`;

// Component.tsx
import { memo } from 'react';
import type { StorageTypeSelectorProps } from './types';
import { ButtonGroup, StorageButton } from './styles';

export const StorageTypeSelector = memo(({ 
  value,
  onChange
}: StorageTypeSelectorProps) => {
  return (
    <ButtonGroup>
      <StorageButton 
        isSelected={value === 'ROOM_TEMP'}
        onPress={() => onChange('ROOM_TEMP')}
      >
        <Text>실온</Text>
      </StorageButton>
      {/* ... other buttons */}
    </ButtonGroup>
  );
});

StorageTypeSelector.displayName = 'StorageTypeSelector';
```

#### 1.2 모드 전환 모달 예시
```typescript
// types.ts
export type ModeTransitionModalProps = {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
};

// styles.ts
import styled from 'styled-components/native';
import { colors, typography } from '@/styles/theme';

export const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const ModalContent = styled.View`
  width: 280px;
  max-height: 400px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
`;

export const ModalScrollContent = styled.ScrollView`
  flex-grow: 0;
  max-height: 300px;
`;

export const ModalTitle = styled.Text`
  ${typography.title};
  margin-bottom: 12px;
`;

export const ModalMessage = styled.Text`
  ${typography.body};
  margin-bottom: 16px;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

// Component.tsx
import { memo } from 'react';
import type { ModeTransitionModalProps } from './types';
import { 
  ModalContainer, 
  ModalContent, 
  ModalScrollContent,
  ModalTitle,
  ModalMessage,
  ButtonContainer 
} from './styles';

export const ModeTransitionModal = memo(({
  isVisible,
  onConfirm,
  onCancel,
  title = "다중 모드로 전환",
  message = "영수증에서 여러 재료가 인식되었습니다.\n다중 모드로 전환하시겠습니까?"
}: ModeTransitionModalProps) => {
  if (!isVisible) return null;

  return (
    <ModalContainer>
      <ModalContent>
        <ModalTitle>{title}</ModalTitle>
        <ModalScrollContent>
          <ModalMessage>{message}</ModalMessage>
        </ModalScrollContent>
        <ButtonContainer>
          <Button variant="secondary" onPress={onCancel}>
            취소
          </Button>
          <Button variant="primary" onPress={onConfirm}>
            전환
          </Button>
        </ButtonContainer>
      </ModalContent>
    </ModalContainer>
  );
});

ModeTransitionModal.displayName = 'ModeTransitionModal';
```

### 2. 상태 관리 규칙

#### 2.1 이미지 인식 모드 상태 관리
```typescript
// stores/navigation.ts
import { create } from 'zustand';

type NavigationStore = {
  isTabBarEnabled: boolean;
  disableTabBar: () => void;
  enableTabBar: () => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  isTabBarEnabled: true,
  disableTabBar: () => set({ isTabBarEnabled: false }),
  enableTabBar: () => set({ isTabBarEnabled: true }),
}));

// components/common/TabBar/Component.tsx
import { useNavigationStore } from '@/stores/navigation';

export const TabBar = memo(() => {
  const isEnabled = useNavigationStore((state) => state.isTabBarEnabled);
  const { navigate } = useNavigation();
  const hapticFeedback = useHapticFeedback();
  const toast = useToast();

  const handleTabPress = (routeName: string) => {
    if (!isEnabled) {
      hapticFeedback.notificationWarning();
      toast.show('현재 작업을 완료해주세요');
      return;
    }
    navigate(routeName);
  };

  return (
    <TabBarContainer>
      <TabButton
        disabled={!isEnabled}
        onPress={() => handleTabPress('home')}
        style={({ pressed }) => [
          styles.tab,
          !isEnabled && styles.tabDisabled,
          pressed && styles.tabPressed
        ]}
      >
        {/* 탭 버튼 내용 */}
      </TabButton>
      {/* 다른 탭 버튼들 */}
    </TabBarContainer>
  );
});

// stores/imageRecognition.ts
type ImageRecognitionStore = {
  mode: 'SINGLE' | 'MULTI';
  recognizedItems: RecognizedItem[];
  isTransitionModalVisible: boolean;
  setMode: (mode: 'SINGLE' | 'MULTI') => void;
  setRecognizedItems: (items: RecognizedItem[]) => void;
  clearRecognizedItems: () => void;
  showTransitionModal: () => void;
  hideTransitionModal: () => void;
  handleModeTransition: (accept: boolean) => void;
};

export const useImageRecognitionStore = create<ImageRecognitionStore>((set, get) => ({
  mode: 'SINGLE',
  recognizedItems: [],
  isTransitionModalVisible: false,
  setMode: (mode) => set({ mode }),
  setRecognizedItems: (items) => set({ recognizedItems: items }),
  clearRecognizedItems: () => set({ recognizedItems: [] }),
  showTransitionModal: () => {
    useNavigationStore.getState().disableTabBar();
    set({ isTransitionModalVisible: true });
  },
  hideTransitionModal: () => {
    useNavigationStore.getState().enableTabBar();
    set({ isTransitionModalVisible: false });
  },
  handleModeTransition: (accept) => {
    if (accept) {
      set({ mode: 'MULTI', isTransitionModalVisible: false });
      // 모든 인식된 아이템을 다중 모드 폼에 추가하는 로직
    } else {
      set({ isTransitionModalVisible: false });
      // 첫 번째 아이템만 단일 모드 폼에 추가하는 로직
    }
    useNavigationStore.getState().enableTabBar();
  },
}));
```

### 3. API 통신 규칙

#### 3.1 이미지 인식 API
```typescript
// services/api/vision.ts
import { apiClient } from './client';
import type { RecognizedItem } from '@/types';

export const visionApi = {
  analyzeImage: (imageData: string) =>
    apiClient.post<{ items: RecognizedItem[] }>(
      '/vision/analyze',
      { image: imageData }
    ),
    
  analyzeReceipt: (imageData: string) =>
    apiClient.post<{ items: RecognizedItem[] }>(
      '/vision/receipt',
      { image: imageData }
    ),
};

// hooks/mutations/useVision.ts
export const useImageAnalysis = () => {
  const { mode, setRecognizedItems } = useImageRecognitionStore();
  
  return useMutation({
    mutationFn: visionApi.analyzeImage,
    onSuccess: ({ items }) => {
      if (mode === 'SINGLE' && items.length > 1) {
        // 모드 전환 모달 표시
        showModeTransitionModal();
      } else {
        setRecognizedItems(items);
      }
    },
  });
};
```

### 4. 성능 최적화 규칙

#### 4.1 이미지 인식 처리
- 이미지 촬영 전 카메라 프리뷰 최적화
- 이미지 압축 및 리사이징
- 인식 중 로딩 상태 표시
- 모드 전환 시 부드러운 애니메이션

### 5. 접근성 규칙
- 모드 전환 시 명확한 피드백 제공
- 이미지 인식 결과에 대한 음성 안내
- 모달의 키보드 접근성 보장

### 6. 에러 처리 규칙
- 이미지 인식 실패 시 재시도 옵션
- 모드 전환 실패 시 폴백 처리
- 네트워크 오류 시 로컬 임시 저장 