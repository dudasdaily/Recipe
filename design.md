# 재료 관리 앱 설계 문서

## 1. 시스템 아키텍처

### 1.1 전체 시스템 구성
```
[클라이언트 앱] <-> [백엔드 서버] <-> [외부 서비스]
     |                |                  |
     |                |                  |
[로컬 Store]      [MySQL DB]      [Google Cloud Vision API]
                                   [Firebase Admin SDK]
```

### 1.2 주요 컴포넌트
- React Native + Expo 모바일 앱
- Node.js + Express.js 백엔드 서버
- MySQL 데이터베이스 (Sequelize ORM)
- Google Cloud Vision API (이미지 인식 및 OCR)
- Firebase Admin SDK (푸시 알림)

### 1.3 실제 기술 스택

#### 클라이언트 (React Native + Expo SDK 53)
- **코어**: React 19.0.0, React Native 0.79.3
- **상태 관리**: Zustand 4.5.2
- **서버 상태**: @tanstack/react-query 5.28.0  
- **네비게이션**: expo-router 5.0.7 (File-based routing)
- **UI 컴포넌트**: Styled Components 6.1.8
- **알림**: expo-notifications 0.31.3, Firebase 10.8.0
- **이미지 처리**: expo-camera 16.1.7, expo-image-picker 16.1.4
- **기타**: @shopify/flash-list, react-native-draggable-flatlist

#### 서버 (Node.js + Express.js)
- **코어**: Express 4.21.2, Node.js
- **데이터베이스**: MySQL2 3.14.1, Sequelize 6.37.7
- **이미지 처리**: @google-cloud/vision 4.0.2, multer 1.4.5
- **인증**: jsonwebtoken 9.0.2, bcryptjs 2.4.3
- **알림**: firebase-admin 12.7.0
- **스케줄링**: node-cron 4.1.0, node-schedule 2.1.1
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
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
- 응답 형식:
  {
    "success": true,
    "data": { /* 생성된 재료 정보 */ }
  }

GET /api/v1/ingredients/{id}
- 특정 재료 조회

PUT /api/v1/ingredients/{id}
- 재료 정보 수정

DELETE /api/v1/ingredients/{id}
- 재료 삭제
- 응답 형식:
  {
    "success": true,
    "message": "재료가 삭제되었습니다."
  }
```

### 3.3 이미지 처리 API - 실제 구현
```
POST /api/v1/vision/analyze
- 식재료 이미지 분석
- Content-Type: multipart/form-data
- 필드: image (파일)
- 성공 응답:
  {
    "success": true,
    "data": {
      "ingredients": [
        {
          "name": "토마토",
          "confidence": 0.95,
          "original": "tomato"
        }
      ],
      "message": "다음과 같은 식재료들이 감지되었습니다.",
      "count": 1
    }
  }
- 실패 응답:
  {
    "success": false,
    "message": "이미지 분석 중 오류가 발생했습니다."
  }

POST /api/v1/ocr/receipt
- 영수증 이미지 OCR 처리
- Content-Type: multipart/form-data
- 필드: image (파일)
- 성공 응답:
  {
    "success": true,
    "message": "영수증이 성공적으로 처리되었습니다. 전체 5개 상품 중 2개의 식재료가 감지되었습니다.",
    "data": {
      "receipt": {
        "id": 1,
        "store_name": "마트명",
        "purchase_date": "2024-01-15T00:00:00.000Z",
        "total_amount": 25000,
        "receipt_image_url": null,
        "user_id": 1,
        "created_at": "2024-01-15T10:00:00.000Z",
        "updated_at": "2024-01-15T10:00:00.000Z"
      },
      "items": [
        {
          "id": 1,
          "receipt_id": 1,
          "name": "토마토",
          "quantity": 2,
          "unit": "개",
          "price": 3000,
          "created_at": "2024-01-15T10:00:00.000Z",
          "updated_at": "2024-01-15T10:00:00.000Z"
        }
      ],
      "summary": {
        "totalItems": 5,
        "ingredientItems": 2,
        "filteredOut": 3
      }
    }
  }

GET /api/v1/ocr/receipt/{id}
- 저장된 영수증 조회
```

### 3.4 알림 API - 실제 구현
```
POST /api/v1/notifications/token
- FCM 토큰 등록
- 요청 형식:
  {
    "token": "FCM 토큰 문자열",
    "userId": 1,
    "deviceInfo": {
      "platform": "ios",
      "version": "17.0",
      "model": "iPhone 15"
    }
  }

POST /api/v1/notifications/settings
- 알림 설정 저장
- 요청 형식:
  {
    "notifyTime": "09:00",
    "notifyDays": ["MON", "TUE", "WED", "THU", "FRI"],
    "isEnabled": true
  }

GET /api/v1/notifications/settings
- 알림 설정 조회

POST /api/v1/notifications/test
- 테스트 알림 전송
- 요청 형식:
  {
    "token": "FCM 토큰",
    "title": "테스트 알림",
    "body": "알림 테스트입니다"
  }

POST /api/v1/notifications/test-public
- 인증 없는 테스트 알림 (개발용)

GET /api/v1/notifications/history
- 알림 히스토리 조회

POST /api/v1/error-log
- 클라이언트 에러 로그 전송 (개발용)
```

## 4. 클라이언트 앱 설계 - 실제 구현

### 4.1 폴더 구조 - 실제 구현
```
client/
├── src/
│   ├── app/                    # Expo Router 파일 기반 라우팅
│   │   ├── _layout.tsx        # 루트 레이아웃
│   │   └── (tabs)/            # 탭 네비게이션
│   │       ├── _layout.tsx    # 탭 레이아웃
│   │       ├── index.tsx      # 홈 화면
│   │       ├── add.tsx        # 추가 화면
│   │       ├── notifications.tsx # 알림 화면
│   │       └── settings.tsx   # 설정 화면
│   ├── components/
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── Button/
│   │   │   └── SegmentedControl/
│   │   └── ingredients/       # 식재료 관련 컴포넌트
│   │       ├── AddIngredientForm/
│   │       │   ├── BulkMode/
│   │       │   └── SingleMode/
│   │       ├── IngredientCard/
│   │       ├── CategorySelector.tsx
│   │       ├── StorageTypeSelector/
│   │       ├── ExpiryDatePicker.tsx
│   │       ├── ReceiptFlow/
│   │       ├── ReceiptScanner/
│   │       └── ReceiptResult/
│   ├── hooks/
│   │   ├── query/             # React Query 훅
│   │   │   └── useIngredients.ts
│   │   ├── useFCMToken.ts
│   │   ├── usePushNotifications.ts
│   │   ├── useExpiryNotification.ts
│   │   ├── useErrorHandler.ts
│   │   └── useSafeAreaStyle.ts
│   ├── services/
│   │   └── api/               # API 클라이언트
│   │       ├── client.ts
│   │       ├── ingredients.ts
│   │       ├── notifications.ts
│   │       ├── ocr.ts
│   │       └── vision.ts
│   ├── stores/                # Zustand 상태 관리
│   │   ├── navigation.ts
│   │   ├── notification.ts
│   │   └── receipt.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── env.d.ts
│   │   └── global.d.ts
│   └── config/
│       ├── env.ts
│       └── firebase.ts
└── assets/                    # 정적 자산
```

### 4.2 주요 화면 구성 - 실제 구현
1. **홈 화면** (`app/(tabs)/index.tsx`)
   - 식재료 목록 (FlashList 사용)
   - 검색 및 필터링 (카테고리, 보관 방법)
   - 유통기한 임박 알림
   - 선택 모드로 일괄 삭제
   - 개별 식재료 수정

2. **추가 화면** (`app/(tabs)/add.tsx`)
   - 단일/다중 모드 전환 (SegmentedControl)
   - 영수증 스캔 플로우
   - 드래그 앤 드롭 재정렬

3. **알림 화면** (`app/(tabs)/notifications.tsx`)
   - 알림 히스토리 표시

4. **설정 화면** (`app/(tabs)/settings.tsx`)
   - 알림 시간 및 요일 설정
   - FCM 토큰 상태 표시
   - 개발 모드 알림 (DEV 모드)
   - 에러 테스트 기능

### 4.3 상태 관리 - 실제 구현
- **Navigation Store**: 탭바 활성화/비활성화 상태
- **Notification Store**: FCM 토큰, 알림 설정 상태
- **Receipt Store**: 영수증 처리 플로우 상태

### 4.4 주요 기능 - 실제 구현
- **이미지 인식**: Google Cloud Vision API 연동
- **영수증 스캔**: OCR을 통한 자동 식재료 추출
- **푸시 알림**: Firebase Admin SDK를 통한 유통기한 알림
- **오프라인**: React Query 캐싱으로 오프라인 지원
- **에러 처리**: 전역 에러 핸들러 및 서버 로깅

## 5. 외부 서비스 연동 - 실제 구현

### 5.1 Google Cloud Vision API
- **Object Detection**: 이미지 내 식재료 객체 감지
- **OCR**: 영수증 텍스트 추출 및 구조화
- **신뢰도 기반 필터링**: 높은 신뢰도 결과만 반환

### 5.2 Firebase Admin SDK
- **FCM (Firebase Cloud Messaging)**: 푸시 알림 전송
- **토큰 관리**: 디바이스별 FCM 토큰 등록 및 관리
- **스케줄링**: node-cron을 통한 알림 스케줄링

## 6. 알림 시스템 설계 - 실제 구현

### 6.1 알림 시스템 구성
```
[NotificationScheduler] -> [NotificationService] -> [Firebase Admin] -> [클라이언트 앱]
        |                          |                       |                  |
[node-cron 스케줄러]    [알림 로직 처리]        [FCM 전송]         [알림 수신]
```

### 6.2 스케줄링 방식
- `node-cron`을 사용한 정기적 실행
- 사용자별 설정 시간에 맞춘 개별 알림
- 유통기한 3일 이하 식재료 자동 감지

### 6.3 개발 환경 제약사항
- Expo Go에서는 푸시 알림 제한
- 로컬 알림만 작동
- 실제 푸시 알림은 빌드된 앱에서만 가능 