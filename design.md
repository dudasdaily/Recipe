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

### 2.1 재료 테이블 (Ingredients)
```sql
CREATE TABLE ingredients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20),           -- 단위 추가 (개, g, kg 등)
    price DECIMAL(10,2),        -- 가격 정보 추가
    receipt_item_id BIGINT,     -- 영수증 항목 참조
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (receipt_item_id) REFERENCES receipt_items(id)
);
```

### 2.2 영수증 테이블 (Receipts)
```sql
CREATE TABLE receipts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_name VARCHAR(100),
    purchase_date DATE,
    total_amount DECIMAL(10,2),
    image_url VARCHAR(255),     -- 영수증 이미지 저장 경로
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.3 영수증 항목 테이블 (Receipt_Items)
```sql
CREATE TABLE receipt_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    receipt_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    quantity INT,
    unit VARCHAR(20),
    price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (receipt_id) REFERENCES receipts(id)
);
```

### 2.4 알림 설정 테이블 (NotificationSettings)
```sql
CREATE TABLE notification_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 3. API 설계

### 3.1 재료 관리 API
```
POST /api/v1/ingredients
- 새로운 재료 추가

GET /api/v1/ingredients
- 재료 목록 조회
- Query Parameters:
  - sort: expiry_date, name, created_at
  - order: asc, desc

PUT /api/v1/ingredients/{id}
- 재료 정보 수정

DELETE /api/v1/ingredients/{id}
- 재료 삭제
```

### 3.2 이미지 처리 API
```
POST /api/v1/vision/analyze
- 이미지 분석 및 식재료 인식
- 응답:
  - success: boolean
  - ingredients: 감지된 식재료 목록 (신뢰도별 분류)
  - message: 상세 메시지
  - suggestions: 개선 제안사항

POST /api/v1/vision/receipt
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
GET /api/v1/notifications/settings
- 알림 설정 조회

PUT /api/v1/notifications/settings
- 알림 설정 수정
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

## 6. 보안 설계

### 6.1 데이터 보안
- HTTPS 통신
- API 키 관리
- 사용자 데이터 암호화

### 6.2 접근 제어
- API 인증 (JWT 토큰)
- 권한 기반 접근 제어

## 7. 성능 최적화

### 7.1 클라이언트
- 이미지 압축
- 지연 로딩
- 메모리 캐싱

### 7.2 서버
- 데이터베이스 인덱싱
- API 응답 캐싱
- 비동기 처리

## 8. 배포 전략

### 8.1 개발 환경
- 개발 서버
- 테스트 서버
- 스테이징 서버

### 8.2 모니터링
- 에러 로깅
- 성능 모니터링
- 사용자 행동 분석 