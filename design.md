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

### 2.0 데이터베이스 생성
```sql
CREATE DATABASE IF NOT EXISTS recipe_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE recipe_db;
```

### 2.1 사용자 테이블 (Users)
```sql
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  password VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  name VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2 식재료 테이블 (Ingredients)
```sql
CREATE TABLE ingredients (
  id INT NOT NULL AUTO_INCREMENT COMMENT '식재료 고유 ID',
  name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '식재료명',
  category VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '카테고리',
  storage_type ENUM('ROOM_TEMP','REFRIGERATED','FROZEN') COLLATE utf8mb4_unicode_ci DEFAULT 'ROOM_TEMP' COMMENT '보관 방법',
  default_expiry_days INT DEFAULT 7 COMMENT '기본 유통기한(일)',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  user_id INT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT ingredients_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='식재료 마스터 테이블';
```

### 2.3 영수증 테이블 (Receipts)
```sql
CREATE TABLE receipts (
  id INT NOT NULL AUTO_INCREMENT COMMENT '영수증 고유 ID',
  user_id INT DEFAULT NULL,
  store_name VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '구매처',
  purchase_date DATETIME NOT NULL COMMENT '구매일',
  total_amount DECIMAL(10,2) DEFAULT NULL COMMENT '총 구매금액',
  receipt_image_url VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '영수증 이미지 URL',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_receipts_user_purchase (user_id, purchase_date),
  CONSTRAINT receipts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 테이블';
```

### 2.4 영수증 항목 테이블 (Receipt_Items)
```sql
CREATE TABLE receipt_items (
  id INT NOT NULL AUTO_INCREMENT COMMENT '영수증 항목 고유 ID',
  receipt_id INT DEFAULT NULL,
  ingredient_id INT DEFAULT NULL,
  quantity INT NOT NULL COMMENT '수량',
  price DECIMAL(10,2) DEFAULT NULL COMMENT '가격',
  expiry_date DATETIME DEFAULT NULL COMMENT '유통기한',
  storage_location VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '보관 위치',
  memo TEXT COLLATE utf8mb4_unicode_ci COMMENT '메모',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_receipt_items_receipt (receipt_id),
  KEY idx_receipt_items_ingredient (ingredient_id),
  KEY idx_receipt_items_expiry (expiry_date),
  CONSTRAINT receipt_items_ibfk_43 FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT receipt_items_ibfk_44 FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 항목 테이블';
```

### 2.5 FCM 토큰 테이블 (FCM_Tokens)
```sql
CREATE TABLE fcm_tokens (
  id INT NOT NULL AUTO_INCREMENT COMMENT 'FCM 토큰 고유 ID',
  user_id INT DEFAULT NULL COMMENT '사용자 ID (외래키)',
  token VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Firebase Cloud Messaging 토큰',
  device_info JSON DEFAULT NULL COMMENT '디바이스 정보 (운영체제, 버전 등)',
  notify_time TIME DEFAULT '09:00:00' COMMENT '알림 발송 시간',
  is_active TINYINT(1) DEFAULT 1 COMMENT '토큰 활성화 상태',
  last_used_at DATETIME DEFAULT NULL COMMENT '마지막 사용 시간',
  created_at DATETIME DEFAULT NULL COMMENT '생성 시간',
  updated_at DATETIME DEFAULT NULL COMMENT '수정 시간',
  PRIMARY KEY (id),
  UNIQUE KEY unique_token (token),
  KEY idx_fcm_tokens_user_id (user_id),
  KEY idx_fcm_tokens_notify_time (notify_time),
  CONSTRAINT fcm_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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

## 6. 알림 시스템 설계

### 6.1 알림 시스템 개요
- Firebase Cloud Messaging(FCM) 기반 푸시 알림 시스템
- 유통기한 임박 재료에 대한 자동 알림
- 사용자 맞춤형 알림 시간 설정

### 6.2 알림 유형 및 내용
1. 유통기한 알림
   - 조건: 유통기한 3일 이하 남은 재료
   - 알림 내용:
     - 재료명
     - 남은 유통기한 (일수)
     - 보관 위치
     - 소비 권장 메시지

2. 알림 설정
   - 알림 수신 시간 (24시간 형식)
   - 알림 수신 요일 선택
   - 알림 활성화/비활성화

### 6.3 알림 시스템 구성
```
[알림 스케줄러] -> [알림 생성기] -> [FCM 서비스] -> [클라이언트 앱]
      |                |                |                |
      |                |                |                |
[DB 조회]        [알림 메시지 생성]   [푸시 전송]    [알림 표시]
```

### 6.4 데이터베이스 스키마
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

### 6.5 API 엔드포인트
```
POST /api/notifications/settings
- 알림 설정 저장
Request:
{
    "notifyTime": "HH:mm",
    "notifyDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    "isEnabled": boolean
}
Response:
{
    "success": boolean,
    "data": {
        "id": number,
        "notifyTime": string,
        "notifyDays": string[],
        "isEnabled": boolean
    }
}

GET /api/notifications/settings
- 알림 설정 조회
Response:
{
    "success": boolean,
    "data": {
        "notifyTime": string,
        "notifyDays": string[],
        "isEnabled": boolean
    }
}

POST /api/notifications/test
- 테스트 알림 전송
Response:
{
    "success": boolean,
    "message": string
}

GET /api/notifications/history
- 알림 히스토리 조회
Response:
{
    "success": boolean,
    "data": {
        "notifications": [
            {
                "id": number,
                "type": string,
                "title": string,
                "body": string,
                "sentAt": string,
                "readAt": string | null
            }
        ]
    }
}
```

### 6.6 알림 메시지 형식
```json
{
    "notification": {
        "title": "유통기한 임박 알림",
        "body": "3개의 재료가 곧 유통기한이 만료됩니다",
        "image": "알림 이미지 URL"
    },
    "data": {
        "type": "EXPIRY_ALERT",
        "ingredients": [
            {
                "id": "재료ID",
                "name": "재료명",
                "expiryDate": "YYYY-MM-DD",
                "storageLocation": "보관위치"
            }
        ]
    }
}
```

### 6.7 알림 처리 프로세스
1. 스케줄러 동작
   - 매일 사용자 설정 시간에 실행
   - 각 사용자별 알림 시간 확인
   - 유통기한 임박 재료 조회

2. 알림 생성
   - 알림 메시지 템플릿 적용
   - 개인화된 메시지 생성
   - 알림 우선순위 설정

3. 알림 전송
   - FCM 토큰 유효성 검증
   - 알림 전송 및 실패 처리
   - 전송 결과 로깅

### 6.8 클라이언트 처리
1. 알림 수신 시 동작
   - 알림 표시
   - 알림 탭 시 해당 재료 상세 화면으로 이동
   - 알림 히스토리 저장

2. 알림 설정 화면
   - 알림 시간 선택 (24시간 형식)
   - 알림 수신 요일 선택
   - 알림 미리보기 기능

3. 알림 권한 관리
   - 초기 앱 실행 시 알림 권한 요청
   - 권한 거부 시 설정 화면에서 재요청 가능
   - 권한 상태 모니터링

### 6.9 오류 처리 및 모니터링
1. 오류 처리
   - FCM 토큰 만료 처리
   - 알림 전송 실패 시 재시도
   - 오류 로깅 및 알림

2. 모니터링
   - 알림 전송 성공/실패율
   - 사용자별 알림 수신률
   - 알림 클릭률

3. 성능 최적화
   - 알림 배치 처리
   - 토큰 관리 최적화
   - 알림 전송 큐 관리 