# 재료 관리 앱 설계 문서

## 1. 시스템 아키텍처

### 1.1 전체 시스템 구성
```
[클라이언트 앱] <-> [백엔드 서버] <-> [외부 서비스]
     |                |                  |
     |                |                  |
[로컬 Store]      [MySQL DB]      [Google Cloud Vision API]
[AsyncStorage]    [Sequelize ORM]   [Firebase Admin SDK]
```

### 1.2 주요 컴포넌트
- **클라이언트**: React Native 0.79.3 + Expo SDK 53 모바일 앱
- **백엔드**: Node.js + Express.js 4.21.2 서버
- **데이터베이스**: MySQL + Sequelize 6.37.7 ORM
- **이미지 처리**: Google Cloud Vision API 4.0.2 (OCR 및 객체 인식)
- **푸시 알림**: Firebase Admin SDK 12.7.0
- **스케줄링**: node-cron 4.1.0 (알림 스케줄러)

### 1.3 실제 기술 스택

#### 클라이언트 (React Native + Expo SDK 53)
- **코어**: React 19.0.0, React Native 0.79.3, TypeScript 5.8.3
- **상태 관리**: Zustand 4.5.2 (전역 상태)
- **서버 상태**: @tanstack/react-query 5.28.0 (캐싱 및 동기화)
- **네비게이션**: expo-router 5.0.7 (파일 기반 라우팅)
- **UI 컴포넌트**: Styled Components 6.1.8
- **알림**: expo-notifications 0.31.3, Firebase 10.8.0
- **이미지 처리**: expo-camera 16.1.7, expo-image-picker 16.1.4
- **성능 최적화**: @shopify/flash-list 1.7.6
- **드래그 앤 드롭**: react-native-draggable-flatlist 4.0.1
- **날짜 선택**: @react-native-community/datetimepicker 8.3.0
- **토스트**: react-native-toast-message 2.2.0
- **저장소**: @react-native-async-storage/async-storage 2.1.2

#### 서버 (Node.js + Express.js)
- **코어**: Express 4.21.2, Node.js
- **데이터베이스**: MySQL2 3.14.1, Sequelize 6.37.7
- **이미지 처리**: @google-cloud/vision 4.0.2, multer 1.4.5
- **인증**: jsonwebtoken 9.0.2, bcryptjs 2.4.3
- **알림**: firebase-admin 12.7.0
- **스케줄링**: node-cron 4.1.0, node-schedule 2.1.1
- **HTTP 클라이언트**: axios 1.9.0
- **기타**: cors 2.8.5, dotenv 16.5.0

## 2. 데이터베이스 설계

### 2.0 데이터베이스 생성
```sql
CREATE DATABASE IF NOT EXISTS recipe_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recipe_db;
```

### 2.1 사용자 테이블 (users)
```sql
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  password VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  name VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2 식재료 테이블 (ingredients) - 실제 구현
```sql
CREATE TABLE ingredients (
  id INT NOT NULL AUTO_INCREMENT COMMENT '식재료 고유 ID',
  name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '식재료명',
  category VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '카테고리',
  storage_type ENUM('ROOM_TEMP','REFRIGERATED','FROZEN') COLLATE utf8mb4_unicode_ci DEFAULT 'ROOM_TEMP' COMMENT '보관 방법',
  quantity INT NOT NULL DEFAULT 1 COMMENT '수량',
  expiry_date DATETIME DEFAULT NULL COMMENT '유통기한',
  default_expiry_days INT DEFAULT 7 COMMENT '기본 유통기한(일)',
  user_id INT DEFAULT NULL COMMENT '사용자 ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT ingredients_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='식재료 마스터 테이블';
```

### 2.3 영수증 테이블 (receipts) - 실제 구현
```sql
CREATE TABLE receipts (
  id INT NOT NULL AUTO_INCREMENT COMMENT '영수증 고유 ID',
  store_name VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '구매처',
  purchase_date DATETIME NOT NULL COMMENT '구매일',
  total_amount DECIMAL(10,2) DEFAULT NULL COMMENT '총 구매금액',
  receipt_image_url VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '영수증 이미지 URL',
  user_id INT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_receipts_user_purchase (user_id, purchase_date),
  CONSTRAINT receipts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 테이블';
```

### 2.4 영수증 항목 테이블 (receipt_items) - 실제 구현
```sql
CREATE TABLE receipt_items (
  id INT NOT NULL AUTO_INCREMENT COMMENT '영수증 항목 고유 ID',
  receipt_id INT DEFAULT NULL,
  ingredient_id INT DEFAULT NULL,
  name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '상품명',
  quantity INT NOT NULL DEFAULT 1 COMMENT '수량',
  unit VARCHAR(20) COLLATE utf8mb4_unicode_ci DEFAULT '개' COMMENT '단위',
  price DECIMAL(10,2) DEFAULT NULL COMMENT '가격',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_receipt_items_receipt (receipt_id),
  KEY idx_receipt_items_ingredient (ingredient_id),
  CONSTRAINT receipt_items_ibfk_1 FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
  CONSTRAINT receipt_items_ibfk_2 FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 항목 테이블';
```

### 2.5 FCM 토큰 테이블 (fcm_tokens) - 실제 구현
```sql
CREATE TABLE fcm_tokens (
  id INT NOT NULL AUTO_INCREMENT COMMENT 'FCM 토큰 고유 ID',
  user_id INT DEFAULT NULL COMMENT '사용자 ID (외래키)',
  token VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Firebase Cloud Messaging 토큰',
  device_info JSON DEFAULT NULL COMMENT '디바이스 정보 (운영체제, 버전 등)',
  notify_time TIME DEFAULT '09:00:00' COMMENT '알림 발송 시간',
  notify_days JSON DEFAULT NULL COMMENT '알림 요일 배열',
  is_active TINYINT(1) DEFAULT 1 COMMENT '토큰 활성화 상태',
  last_used_at DATETIME DEFAULT NULL COMMENT '마지막 사용 시간',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (id),
  UNIQUE KEY unique_token (token),
  KEY idx_fcm_tokens_user_id (user_id),
  KEY idx_fcm_tokens_notify_time (notify_time),
  CONSTRAINT fcm_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.6 알림 설정 테이블 (notification_settings) - 실제 구현
```sql
CREATE TABLE notification_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notify_time TIME NOT NULL DEFAULT '09:00:00',
  notify_days JSON NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2.7 알림 히스토리 테이블 (notification_history) - 실제 구현
```sql
CREATE TABLE notification_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSON,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 3. API 설계 - 실제 구현

### 3.1 기본 API 구조
모든 API는 `/api/v1/` 경로 prefix를 사용합니다.

### 3.2 재료 관리 API - 실제 구현
```
GET /api/v1/ingredients
- 재료 목록 조회
- 응답 형식:
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "토마토",
        "category": "채소",
        "storage_type": "REFRIGERATED",
        "quantity": 2,
        "expiry_date": "2024-01-20T00:00:00.000Z",
        "default_expiry_days": 7,
        "user_id": 1,
        "created_at": "2024-01-15T10:00:00.000Z",
        "updated_at": "2024-01-15T10:00:00.000Z"
      }
    ]
  }

POST /api/v1/ingredients
- 새로운 재료 추가
- 요청 형식:
  {
    "name": "토마토",
    "category": "채소",
    "storage_type": "REFRIGERATED",
    "quantity": 2,
    "expiry_date": "2024-01-20",
    "default_expiry_days": 7
  }

GET /api/v1/ingredients/{id}
- 특정 재료 조회

PUT /api/v1/ingredients/{id}
- 재료 정보 수정

DELETE /api/v1/ingredients/{id}
- 재료 삭제
```

### 3.3 이미지 처리 API - 실제 구현
```
POST /api/v1/vision/analyze
- 식재료 이미지 분석 (Google Cloud Vision API)
- Content-Type: multipart/form-data
- 필드: image (파일)

POST /api/v1/ocr/receipt
- 영수증 이미지 OCR 처리
- Content-Type: multipart/form-data
- 필드: image (파일)
- 성공 응답: 식재료만 필터링된 결과 반환

GET /api/v1/ocr/receipt/{id}
- 저장된 영수증 조회
```

### 3.4 알림 API - 실제 구현
```
POST /api/v1/notifications/token
- FCM 토큰 등록

POST /api/v1/notifications/settings
- 알림 설정 저장

GET /api/v1/notifications/settings
- 알림 설정 조회

POST /api/v1/notifications/test
- 테스트 알림 전송

GET /api/v1/notifications/history
- 알림 히스토리 조회

POST /api/notification-log
- 알림 도착 로그 기록 (클라이언트용)
```

### 3.5 에러 로깅 API
```
POST /api/error-log
- 클라이언트 에러 로그 전송 (개발/디버깅용)
```

## 4. 클라이언트 앱 설계 - 실제 구현

### 4.1 폴더 구조 - 실제 구현
```
client/
├── src/
│   ├── app/                    # Expo Router 파일 기반 라우팅
│   │   ├── _layout.tsx        # 루트 레이아웃 (QueryClient, FCM 초기화)
│   │   └── (tabs)/            # 탭 네비게이션 그룹
│   │       ├── _layout.tsx    # 탭 레이아웃 (Feather 아이콘)
│   │       ├── index.tsx      # 홈 화면 (FlashList, 검색, 필터)
│   │       ├── add.tsx        # 추가 화면 (SegmentedControl, 모드 전환)
│   │       ├── notifications.tsx # 알림 히스토리
│   │       └── settings.tsx   # 설정 (알림, FCM, 개발자 도구)
│   ├── components/
│   │   ├── AppInitializer.tsx # 앱 초기화 (에러 핸들러, FCM)
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── Button/        # 재사용 버튼
│   │   │   └── SegmentedControl/ # iOS 스타일 세그먼트
│   │   └── ingredients/       # 식재료 관련 컴포넌트
│   │       ├── AddIngredientForm/ # 추가 폼
│   │       │   ├── BulkMode/   # 다중 모드 (DraggableFlatList)
│   │       │   │   ├── index.tsx
│   │       │   │   └── BulkIngredientItem.tsx
│   │       │   ├── SingleMode/ # 단일 모드
│   │       │   │   └── index.tsx
│   │       │   ├── index.tsx   # 메인 폼 컨테이너
│   │       │   └── ImageRecognitionActions.tsx
│   │       ├── IngredientCard/ # 목록 아이템
│   │       │   ├── index.tsx
│   │       │   ├── styles.ts
│   │       │   └── types.ts
│   │       ├── StorageTypeSelector/ # 보관 방법 선택
│   │       ├── ReceiptFlow/    # 영수증 처리 플로우
│   │       ├── ReceiptScanner/ # 카메라/갤러리
│   │       ├── ReceiptResult/  # OCR 결과 편집
│   │       ├── CategorySelector.tsx # 카테고리 선택
│   │       ├── ExpiryDatePicker.tsx # 날짜 선택
│   │       ├── SearchBar.tsx   # 검색
│   │       ├── ExpiryAlert.tsx # 유통기한 알림
│   │       └── EditIngredientForm.tsx # 수정 폼
│   ├── hooks/
│   │   ├── query/             # React Query 훅
│   │   │   └── useIngredients.ts # CRUD 작업
│   │   ├── useFCMToken.ts     # FCM 토큰 관리
│   │   ├── usePushNotifications.ts # 푸시 알림 처리
│   │   ├── useExpiryNotification.ts # 유통기한 알림
│   │   ├── useLocalExpiryNotification.ts # 로컬 알림
│   │   ├── useIngredientsCache.ts # 캐시 관리
│   │   ├── useErrorHandler.ts # 전역 에러 처리
│   │   └── useSafeAreaStyle.ts # SafeArea 스타일링
│   ├── services/api/          # API 클라이언트
│   │   ├── client.ts          # Axios 기본 설정 + 인터셉터
│   │   ├── ingredients.ts     # 식재료 API
│   │   ├── notifications.ts   # 알림 API
│   │   ├── notificationLog.ts # 알림 로그 API
│   │   ├── ocr.ts             # OCR API
│   │   └── vision.ts          # 이미지 인식 API
│   ├── stores/                # Zustand 상태 관리
│   │   ├── navigation.ts      # 탭바 제어
│   │   ├── notification.ts    # FCM 토큰, 알림 설정
│   │   └── receipt.ts         # 영수증 플로우 상태
│   ├── types/                 # TypeScript 타입
│   │   ├── api.ts             # API 관련 타입
│   │   ├── env.d.ts           # 환경 변수 타입
│   │   └── global.d.ts        # 전역 타입
│   └── config/                # 설정 파일
│       ├── env.ts             # 환경 변수 관리 (EnvConfig 클래스)
│       └── firebase.ts        # Firebase 초기화
└── assets/                    # 정적 자산
```

### 4.2 주요 화면 구성 - 실제 구현

#### 4.2.1 홈 화면 (`app/(tabs)/index.tsx`)
- **FlashList**를 사용한 성능 최적화된 목록
- **실시간 검색**: `SearchBar` 컴포넌트
- **필터링**: 보관 방법별, 카테고리별
- **정렬**: created_at DESC (최신 순)
- **유통기한 임박 알림**: `ExpiryAlert` 컴포넌트 (horizontal scroll)
- **선택 모드**: 다중 선택 후 일괄 삭제
- **개별 수정**: 모달 형태의 `EditIngredientForm`

#### 4.2.2 추가 화면 (`app/(tabs)/add.tsx`)
- **SegmentedControl**로 단일/다중 모드 전환
- **단일 모드**: 기본 정보 입력, 이미지 인식
- **다중 모드**: DraggableFlatList, 영수증 스캔 플로우

#### 4.2.3 알림 화면 (`app/(tabs)/notifications.tsx`)
- 알림 히스토리 표시
- 읽음/안읽음 상태 관리

#### 4.2.4 설정 화면 (`app/(tabs)/settings.tsx`)
- 알림 시간 및 요일 설정
- FCM 토큰 상태 표시
- 개발 모드 전용 기능 (테스트 알림, 에러 로그 등)

### 4.3 상태 관리 - 실제 구현

#### 4.3.1 Zustand 스토어
- **Navigation Store**: 탭바 활성화/비활성화 상태
- **Notification Store**: FCM 토큰, 알림 설정 상태
- **Receipt Store**: 영수증 처리 플로우 상태

#### 4.3.2 React Query
- 서버 상태 캐싱 및 동기화
- 오프라인 지원
- 자동 재시도 및 백그라운드 업데이트

### 4.4 주요 기능 - 실제 구현

#### 4.4.1 이미지 인식
- Google Cloud Vision API 연동
- 식재료 객체 감지 및 신뢰도 기반 필터링

#### 4.4.2 영수증 스캔
- OCR을 통한 자동 식재료 추출
- 단계별 플로우 관리 (SCAN → REVIEW → EDIT → SAVE)
- 탭바 제어 (처리 중 비활성화)

#### 4.4.3 푸시 알림
- Firebase Admin SDK를 통한 서버 발송
- 로컬 알림 (유통기한 기반)
- 개발 환경 제약사항 (Expo Go 제한)

## 5. 서버 설계 - 실제 구현

### 5.1 폴더 구조 - 실제 구현
```
server/
├── src/
│   ├── app.js                 # 메인 애플리케이션 (Express 설정)
│   ├── config/                # 설정 파일
│   │   ├── database.js
│   │   ├── db.js
│   │   └── firebase.js
│   ├── models/                # Sequelize 모델
│   │   ├── index.js           # 모델 초기화 및 관계 설정
│   │   ├── User.js
│   │   ├── Ingredient.js
│   │   ├── Receipt.js
│   │   ├── ReceiptItem.js
│   │   ├── FCMToken.js
│   │   ├── NotificationSetting.js
│   │   └── NotificationHistory.js
│   ├── controllers/           # 비즈니스 로직
│   │   ├── ingredientController.js
│   │   ├── NotificationController.js
│   │   ├── ocrController.js
│   │   └── visionController.js
│   ├── routes/                # API 라우트
│   │   ├── ingredientRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── notification.js
│   │   ├── ocrRoutes.js
│   │   ├── visionRoutes.js
│   │   └── errorLog.js
│   ├── services/              # 외부 서비스 연동
│   │   ├── NotificationService.js
│   │   ├── NotificationScheduler.js
│   │   ├── ocrService.js
│   │   └── visionService.js
│   ├── middleware/            # 미들웨어
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── scripts/               # 유틸리티 스크립트
│   │   └── createDefaultUser.js
│   └── api/                   # 추가 API 엔드포인트
│       ├── ingredient.js
│       ├── ingredients.js
│       └── recommend.js
├── check-tokens.js            # FCM 토큰 검증 스크립트
├── fix-token.js               # FCM 토큰 수정 스크립트
├── test-notification.js       # 알림 테스트 스크립트
├── firebase-service-account.json # Firebase 서비스 계정
├── vision-key.json            # Google Cloud Vision API 키
└── .env                       # 환경 변수
```

### 5.2 알림 시스템 설계 - 실제 구현

#### 5.2.1 알림 시스템 구성
```
[NotificationScheduler] -> [NotificationService] -> [Firebase Admin] -> [클라이언트 앱]
        |                          |                       |                  |
[node-cron 스케줄러]    [알림 로직 처리]        [FCM 전송]         [알림 수신]
```

#### 5.2.2 스케줄링 방식
- `node-cron`을 사용한 정기적 실행
- 사용자별 설정 시간에 맞춘 개별 알림
- 유통기한 3일 이하 식재료 자동 감지

## 6. 외부 서비스 연동 - 실제 구현

### 6.1 Google Cloud Vision API
- **Object Detection**: 이미지 내 식재료 객체 감지
- **OCR**: 영수증 텍스트 추출 및 구조화
- **신뢰도 기반 필터링**: 높은 신뢰도 결과만 반환

### 6.2 Firebase Admin SDK
- **FCM (Firebase Cloud Messaging)**: 푸시 알림 전송
- **토큰 관리**: 디바이스별 FCM 토큰 등록 및 관리
- **스케줄링**: node-cron을 통한 알림 스케줄링

### 6.3 개발 환경 제약사항
- **Expo Go 제한**: 푸시 알림 수신 불가
- **로컬 알림만 작동**: 개발 중에는 expo-notifications 사용
- **실제 푸시 알림**: 빌드된 앱(EAS Build)에서만 가능

## 7. 데이터 흐름 및 상호작용

### 7.1 앱 시작 흐름
1. **AppInitializer**: 전역 에러 핸들러, FCM 초기화
2. **Root Layout**: QueryClient 설정, 타이머 권한 요청
3. **스토어 하이드레이션**: AsyncStorage에서 상태 복원
4. **FCM 토큰 생성**: 알림 권한 요청 후 토큰 생성 및 서버 등록

### 7.2 식재료 관리 흐름
1. **목록 조회**: React Query로 캐시된 데이터 표시
2. **추가**: 단일/다중 모드, 이미지 인식, 영수증 스캔
3. **수정**: 인라인 편집 또는 모달 폼
4. **삭제**: 개별 또는 일괄 삭제

### 7.3 알림 흐름
1. **서버 스케줄러**: 유통기한 3일 이하 식재료 감지
2. **FCM 발송**: Firebase Admin SDK로 푸시 알림 전송
3. **로컬 알림**: 클라이언트에서 보조적으로 스케줄링
4. **알림 처리**: 포그라운드/백그라운드 수신 및 액션 처리

## 8. 성능 최적화

### 8.1 클라이언트 최적화
- **FlashList**: 대용량 목록 성능 최적화
- **React Query**: 서버 상태 캐싱 및 백그라운드 업데이트
- **AsyncStorage**: 오프라인 데이터 영속성
- **이미지 압축**: expo-image-picker 옵션 활용

### 8.2 서버 최적화
- **데이터베이스 인덱싱**: 자주 조회되는 컬럼에 인덱스 설정
- **Connection Pooling**: Sequelize 기본 커넥션 풀 활용
- **에러 처리**: 전역 에러 핸들러 및 로깅 시스템

## 9. 보안 고려사항

### 9.1 API 보안
- **CORS 설정**: 특정 도메인에서만 접근 허용
- **입력 검증**: Express 미들웨어를 통한 데이터 검증
- **에러 핸들링**: 민감한 정보 노출 방지

### 9.2 데이터 보안
- **FCM 토큰 관리**: 토큰 만료 및 갱신 처리
- **환경 변수**: 민감한 설정 정보는 .env 파일로 관리
- **서비스 계정**: Firebase 및 Google Cloud 서비스 계정 키 보안 관리 