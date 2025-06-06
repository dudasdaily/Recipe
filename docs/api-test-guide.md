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

#### 1.3. 특정 재료 조회
```
Method: GET
URL: http://localhost:3000/api/v1/ingredients/:id
Headers: 없음
Body: 없음
```
- `:id`는 조회하고자 하는 재료의 실제 ID로 대체

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

#### 1.5. 재료 삭제
```
Method: DELETE
URL: http://localhost:3000/api/v1/ingredients/:id
Headers: 없음
Body: 없음
```
- `:id`는 삭제하고자 하는 재료의 실제 ID로 대체

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

#### 2.2. 저장된 영수증 조회
```
Method: GET
URL: http://localhost:3000/api/v1/ocr/receipt/:id
Headers: 없음
Body: 없음
```
- `:id`는 조회하고자 하는 영수증의 실제 ID로 대체

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

## 테스트 시나리오

### 재료 API 테스트 시나리오

1. 재료 생성 테스트
   1. POST /ingredients로 새로운 재료 생성
   2. 응답에서 생성된 재료의 ID 확인

2. 재료 조회 테스트
   1. GET /ingredients/:id로 생성된 재료 조회
   2. 데이터가 정상적으로 저장되었는지 확인

3. 재료 수정 테스트
   1. PUT /ingredients/:id로 재료 정보 수정
   2. GET /ingredients/:id로 수정된 정보 확인

4. 재료 목록 조회 테스트
   1. GET /ingredients로 전체 목록 조회
   2. 생성/수정된 재료가 목록에 포함되어 있는지 확인

5. 재료 삭제 테스트
   1. DELETE /ingredients/:id로 재료 삭제
   2. GET /ingredients/:id로 삭제 확인 (404 응답 확인)

### 이미지 분석 API 테스트 시나리오

1. 영수증 OCR 테스트
   1. 테스트용 영수증 이미지 준비
   2. POST /ocr/receipt로 이미지 업로드
   3. 분석 결과 확인

2. 이미지 분석 테스트
   1. 테스트용 식재료 이미지 준비
   2. POST /vision/analyze로 이미지 업로드
   3. 분석 결과 확인

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