# Recipe API 테스트 가이드

이 문서는 Recipe 애플리케이션의 API를 Postman을 사용하여 테스트하는 방법을 설명합니다.

## 기본 설정

- 기본 URL: `http://localhost:3000/api/v1`
- 서버 실행 방법: 프로젝트 루트 디렉토리에서 `npm start` 실행

## API 엔드포인트

### 1. 재료(Ingredients) API

#### 1.1. 재료 목록 조회
```
Method: GET
URL: http://localhost:3000/api/v1/ingredients
Headers: 없음
Body: 없음
```

예상 응답:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "당근",
            "category": "채소",
            "storage_type": "REFRIGERATED",
            "default_expiry_days": 7,
            "created_at": "2025-06-06T15:05:55.000Z",
            "updated_at": "2025-06-06T15:05:55.000Z"
        }
    ]
}
```

#### 1.2. 재료 생성
```
Method: POST
URL: http://localhost:3000/api/v1/ingredients
Headers: 
  Content-Type: application/json
Body (raw JSON):
{
    "name": "당근",
    "category": "채소",
    "storage_type": "REFRIGERATED",
    "default_expiry_days": 7
}
```

- `storage_type` 가능한 값:
  - `ROOM_TEMP`: 실온 보관
  - `REFRIGERATED`: 냉장 보관
  - `FROZEN`: 냉동 보관

예상 응답:
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "당근",
        "category": "채소",
        "storage_type": "REFRIGERATED",
        "default_expiry_days": 7,
        "created_at": "2024-03-19T12:00:00.000Z",
        "updated_at": "2024-03-19T12:00:00.000Z"
    }
}
```

#### 1.3. 특정 재료 조회
```
Method: GET
URL: http://localhost:3000/api/v1/ingredients/:id
Headers: 없음
Body: 없음
```
- `:id`는 조회하고자 하는 재료의 실제 ID로 대체

예상 응답:
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "당근",
        "category": "채소",
        "storage_type": "REFRIGERATED",
        "default_expiry_days": 7,
        "created_at": "2024-03-19T12:00:00.000Z",
        "updated_at": "2024-03-19T12:00:00.000Z"
    }
}
```

#### 1.4. 재료 수정
```
Method: PUT
URL: http://localhost:3000/api/v1/ingredients/:id
Headers: 
  Content-Type: application/json
Body (raw JSON):
{
    "name": "당근",
    "category": "채소",
    "storage_type": "REFRIGERATED",
    "default_expiry_days": 7
}
```
- `:id`는 수정하고자 하는 재료의 실제 ID로 대체

예상 응답:
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "당근",
        "category": "채소",
        "storage_type": "REFRIGERATED",
        "default_expiry_days": 7,
        "created_at": "2024-03-19T12:00:00.000Z",
        "updated_at": "2024-03-19T12:30:00.000Z"
    }
}
```

#### 1.5. 재료 삭제
```
Method: DELETE
URL: http://localhost:3000/api/v1/ingredients/:id
Headers: 없음
Body: 없음
```
- `:id`는 삭제하고자 하는 재료의 실제 ID로 대체

예상 응답:
```json
{
    "success": true,
    "message": "재료가 성공적으로 삭제되었습니다."
}
```

### 2. 영수증 OCR API

#### 2.1. 영수증 이미지 분석
```
Method: POST
URL: http://localhost:3000/api/v1/ocr/receipt
Headers: 
  Content-Type: multipart/form-data
Body:
  Key: image
  Value: [영수증 이미지 파일 선택]
```

주의사항:
- 이미지 파일 크기는 5MB 이하여야 함
- form-data의 키 이름은 반드시 'image'여야 함

예상 응답:
```json
{
    "success": true,
    "data": {
        "receipt": {
            "id": 1,
            "storeName": "마트이름",
            "purchaseDate": "2024-03-19",
            "totalAmount": 50000,
            "imageUrl": "/uploads/receipts/receipt-1.jpg"
        },
        "items": [
            {
                "id": 1,
                "name": "당근",
                "quantity": 3,
                "unit": "개",
                "price": 3000
            },
            {
                "id": 2,
                "name": "양파",
                "quantity": 2,
                "unit": "개",
                "price": 2000
            }
        ]
    }
}
```

#### 2.2. 저장된 영수증 조회
```
Method: GET
URL: http://localhost:3000/api/v1/ocr/receipt/:id
Headers: 없음
Body: 없음
```
- `:id`는 조회하고자 하는 영수증의 실제 ID로 대체

예상 응답:
```json
{
    "success": true,
    "data": {
        "receipt": {
            "id": 1,
            "storeName": "마트이름",
            "purchaseDate": "2024-03-19",
            "totalAmount": 50000,
            "imageUrl": "/uploads/receipts/receipt-1.jpg",
            "items": [
                {
                    "id": 1,
                    "name": "당근",
                    "quantity": 3,
                    "unit": "개",
                    "price": 3000
                },
                {
                    "id": 2,
                    "name": "양파",
                    "quantity": 2,
                    "unit": "개",
                    "price": 2000
                }
            ]
        }
    }
}
```

### 3. 이미지 분석(Vision) API

#### 3.1. 이미지 분석
```
Method: POST
URL: http://localhost:3000/api/v1/vision/analyze
Headers: 
  Content-Type: multipart/form-data
Body:
  Key: image
  Value: [분석할 이미지 파일 선택]
```

주의사항:
- 이미지 파일 크기는 5MB 이하여야 함
- 이미지 파일만 업로드 가능
- form-data의 키 이름은 반드시 'image'여야 함

성공 응답 예시:
```json
{
    "success": true,
    "data": {
        "ingredients": [
            {
                "name": "당근",
                "confidence": 0.95,
                "original": "Carrot"
            },
            {
                "name": "양파",
                "confidence": 0.88,
                "original": "Onion"
            }
        ],
        "message": "다음과 같은 식재료들이 감지되었습니다.",
        "count": 2
    }
}
```

실패 응답 예시:
```json
{
    "success": false,
    "message": "이미지에서 식재료를 찾을 수 없습니다.",
    "suggestion": "다른 각도에서 찍은 사진이나, 더 밝은 조명에서 찍은 사진으로 다시 시도해보세요."
}
```

## 오류 처리

모든 API는 다음과 같은 형식으로 오류를 반환합니다:

```json
{
    "success": false,
    "message": "오류 메시지"
}
```

주요 HTTP 상태 코드:
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 404: 리소스를 찾을 수 없음
- 500: 서버 내부 오류 