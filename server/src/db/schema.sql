-- 1. 데이터베이스 생성 및 선택
CREATE DATABASE IF NOT EXISTS recipe_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE recipe_db;

-- 2. users 테이블
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  password VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  name VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. receipts 테이블
CREATE TABLE IF NOT EXISTS receipts (
  id INT NOT NULL AUTO_INCREMENT COMMENT '영수증 고유 ID',
  user_id INT DEFAULT NULL,
  store_name VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '구매처',
  purchase_date DATETIME NOT NULL COMMENT '구매일',
  total_amount DECIMAL(10,2) DEFAULT NULL COMMENT '총 구매금액',
  receipt_image_url VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '영수증 이미지 URL',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_receipts_user_purchase (user_id, purchase_date),
  CONSTRAINT receipts_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 테이블';

-- 4. ingredients 테이블 (프론트와 완전 호환)
CREATE TABLE IF NOT EXISTS ingredients (
  id INT NOT NULL AUTO_INCREMENT COMMENT '식재료 고유 ID',
  name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '식재료명',
  category VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '카테고리',
  storage_type ENUM('ROOM_TEMP','REFRIGERATED','FROZEN') COLLATE utf8mb4_unicode_ci DEFAULT 'ROOM_TEMP' COMMENT '보관 방법',
  quantity INT NOT NULL DEFAULT 1 COMMENT '수량',
  expiry_date DATE DEFAULT NULL COMMENT '유통기한',
  default_expiry_days INT DEFAULT 7 COMMENT '기본 유통기한(일)',
  user_id INT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT ingredients_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='식재료 마스터 테이블';

-- 5. receipt_items 테이블
CREATE TABLE IF NOT EXISTS receipt_items (
  id INT NOT NULL AUTO_INCREMENT COMMENT '영수증 항목 고유 ID',
  receipt_id INT DEFAULT NULL,
  ingredient_id INT DEFAULT NULL,
  quantity INT NOT NULL DEFAULT 1 COMMENT '수량',
  price DECIMAL(10,2) DEFAULT NULL COMMENT '가격',
  expiry_date DATE DEFAULT NULL COMMENT '유통기한',
  storage_location VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '보관 위치',
  memo TEXT COLLATE utf8mb4_unicode_ci COMMENT '메모',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_receipt_items_receipt (receipt_id),
  KEY idx_receipt_items_ingredient (ingredient_id),
  KEY idx_receipt_items_expiry (expiry_date),
  CONSTRAINT receipt_items_ibfk_43 FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT receipt_items_ibfk_44 FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='영수증 항목 테이블';

-- 6. fcm_tokens 테이블
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id INT NOT NULL AUTO_INCREMENT COMMENT 'FCM 토큰 고유 ID',
  user_id INT DEFAULT NULL COMMENT '사용자 ID (외래키)',
  token VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Firebase Cloud Messaging 토큰',
  device_info JSON DEFAULT NULL COMMENT '디바이스 정보 (운영체제, 버전 등)',
  notify_time TIME DEFAULT '09:00:00' COMMENT '알림 발송 시간',
  is_active TINYINT(1) DEFAULT 1 COMMENT '토큰 활성화 상태',
  last_used_at DATETIME DEFAULT NULL COMMENT '마지막 사용 시간',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_token (token),
  KEY idx_fcm_tokens_user_id (user_id),
  KEY idx_fcm_tokens_notify_time (notify_time),
  CONSTRAINT fcm_tokens_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. notification_settings 테이블
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notify_time TIME NOT NULL DEFAULT '09:00:00',
    notify_days JSON NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. notification_history 테이블
CREATE TABLE IF NOT EXISTS notification_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSON,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 인덱스 생성
CREATE INDEX idx_receipt_purchase_date ON receipts(purchase_date);
CREATE INDEX idx_ingredients_expiry_date ON ingredients(expiry_date);
CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX idx_ingredients_receipt_item_id ON ingredients(receipt_item_id); 