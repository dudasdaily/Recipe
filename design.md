# 재료 관리 앱 설계 문서

## 1. 시스템 아키텍처

### 1.1 전체 시스템 구성
```
[클라이언트 앱] <-> [백엔드 서버] <-> [외부 서비스]
     |                |                  |
     |                |                  |
[로컬 DB]        [메인 DB]        [OCR/이미지 인식 API]
```

### 1.2 주요 컴포넌트
- 모바일 앱 (Android/iOS)
- 백엔드 서버
- 데이터베이스
- 외부 API 연동 서비스

## 2. 데이터베이스 설계

### 2.1 사용자 테이블 (Users)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '사용자 고유 ID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 (해시)',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 정보 테이블';
```

### 2.2 식재료 테이블 (Ingredients)
```sql
CREATE TABLE ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '식재료 고유 ID',
    name VARCHAR(100) NOT NULL COMMENT '식재료명',
    category VARCHAR(50) COMMENT '카테고리',
    storage_type ENUM('ROOM_TEMP', 'REFRIGERATED', 'FROZEN') DEFAULT 'ROOM_TEMP' COMMENT '보관 방법',
    default_expiry_days INT COMMENT '기본 유통기한(일)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    INDEX idx_ingredients_name (name),
    INDEX idx_ingredients_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='식재료 마스터 테이블';
```

### 2.3 영수증 테이블 (Receipts)
```sql
CREATE TABLE receipts (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '영수증 고유 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    store_name VARCHAR(100) COMMENT '구매처',
    purchase_date DATE NOT NULL COMMENT '구매일',
    total_amount DECIMAL(10,2) COMMENT '총 구매금액',
    receipt_image_url VARCHAR(255) COMMENT '영수증 이미지 URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_receipts_user_purchase (user_id, purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 테이블';
```

### 2.4 영수증 항목 테이블 (Receipt_Items)
```sql
CREATE TABLE receipt_items (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '영수증 항목 고유 ID',
    receipt_id INT NOT NULL COMMENT '영수증 ID',
    ingredient_id INT NOT NULL COMMENT '식재료 ID',
    quantity INT NOT NULL COMMENT '수량',
    price DECIMAL(10,2) COMMENT '가격',
    expiry_date DATE COMMENT '유통기한',
    storage_location VARCHAR(50) COMMENT '보관 위치',
    memo TEXT COMMENT '메모',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
    INDEX idx_receipt_items_receipt (receipt_id),
    INDEX idx_receipt_items_ingredient (ingredient_id),
    INDEX idx_receipt_items_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 항목 테이블';
```

### 2.5 FCM 토큰 테이블 (FCM_Tokens)
```sql
CREATE TABLE fcm_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'FCM 토큰 고유 ID',
    user_id INT COMMENT '사용자 ID (외래키)',
    token VARCHAR(255) NOT NULL COMMENT 'Firebase Cloud Messaging 토큰',
    device_info JSON COMMENT '디바이스 정보 (운영체제, 버전 등)',
    notify_time TIME DEFAULT '09:00:00' COMMENT '알림 발송 시간',
    is_active BOOLEAN DEFAULT TRUE COMMENT '토큰 활성화 상태',
    last_used_at DATETIME COMMENT '마지막 사용 시간',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    UNIQUE KEY uk_fcm_tokens_token (token),
    INDEX idx_fcm_tokens_user_id (user_id),
    INDEX idx_fcm_tokens_notify_time (notify_time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='FCM 토큰 관리 테이블';
```

## 3. API 설계

### 3.1 재료 관리 API
```
POST /api/ingredients
- 새로운 재료 추가

GET /api/ingredients
- 재료 목록 조회
- Query Parameters:
  - sort: expiry_date, name, created_at
  - order: asc, desc

PUT /api/ingredients/{id}
- 재료 정보 수정

DELETE /api/ingredients/{id}
- 재료 삭제
```

### 3.2 이미지 처리 API
```
POST /api/vision/analyze
- 이미지 분석 및 식재료 인식
- 응답:
  - success: boolean
  - data: {
    ingredients: [
      {
        name: string (한글 식재료명),
        confidence: number (신뢰도 0~1),
        original: string (영문 원본명)
      }
    ],
    message: string (처리 결과 메시지),
    count?: number (감지된 재료 수),
    suggestion?: string (개선 제안사항)
  }
  - error?: string (에러 발생 시 에러 메시지)

POST /api/vision/receipt
- 영수증 이미지 OCR 처리
- 응답:
  - success: boolean
  - items: 감지된 상품 목록
    - name: 상품명
    - price: 가격
    - quantity: 수량 (있는 경우)
  - total: 총액 (감지된 경우)
  - date: 구매 일자 (감지된 경우)
  - store: 상점 정보 (감지된 경우)
```

### 3.3 알림 API
```
POST /api/fcm/register
- FCM 토큰 등록
- Request Body:
  - token: FCM 토큰 문자열
  - userId: 사용자 ID (선택)
  - deviceInfo: 디바이스 정보 (선택)

POST /api/fcm/set-time
- 알림 시간 설정
- Request Body:
  - token: FCM 토큰
  - notifyTime: 알림 시간 (HH:mm:ss 형식)

POST /api/fcm/test
- 테스트 알림 전송
- Request Body:
  - token: FCM 토큰
  - title: 알림 제목
  - body: 알림 내용

POST /api/fcm/notify-expiring
- 유통기한 임박 알림 수동 트리거
```

## 4. 클라이언트 앱 설계

### 4.1 주요 화면 구성
1. 메인 화면
   - 재료 목록 표시
   - 정렬/필터링 옵션
   - 재료 추가 버튼

2. 재료 추가 화면
   - 수동 입력 폼
   - 영수증 스캔 버튼
   - 이미지 촬영 버튼

3. 설정 화면
   - 알림 설정
   - 앱 정보

### 4.2 로컬 데이터 관리
- Room DB (Android) / Core Data (iOS) 사용
- 오프라인 모드 지원을 위한 로컬 캐싱
- 백그라운드 동기화

## 5. 외부 서비스 연동

### 5.1 이미지 인식 및 OCR 서비스
- Google Cloud Vision API 사용
- 이미지 내 객체 감지 (Object Detection)
  - 식재료 인식 및 분류
  - 신뢰도 기반 결과 필터링 (80% 이상: 확실, 60-80%: 추정, 60% 미만: 불확실)
  - 한글 변환 사전 적용 (채소류, 과일류, 육류, 해산물, 기타 재료)
- OCR (Optical Character Recognition)
  - 영수증 텍스트 추출
  - 구조화된 데이터 파싱
    - 상품명과 가격 매칭
    - 날짜 및 시간 추출
    - 상점 정보 추출
  - 한글 영수증 최적화 처리

### 5.2 푸시 알림 서비스
- Firebase Cloud Messaging 사용
- 유통기한 알림 전송 