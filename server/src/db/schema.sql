-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS receipt_items;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS notification_settings;

-- 영수증 테이블 생성
CREATE TABLE receipts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_name VARCHAR(100),
    purchase_date DATE,
    total_amount DECIMAL(10,2),
    image_url VARCHAR(255),     -- 영수증 이미지 저장 경로
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 영수증 항목 테이블 생성
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
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 재료 테이블 생성
CREATE TABLE ingredients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20),           -- 단위 (개, g, kg 등)
    price DECIMAL(10,2),        -- 가격 정보
    receipt_item_id BIGINT,     -- 영수증 항목 참조
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (receipt_item_id) REFERENCES receipt_items(id)
        ON DELETE SET NULL      -- 영수증 항목이 삭제되어도 재료 정보는 유지
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 알림 설정 테이블 생성
CREATE TABLE notification_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 인덱스 생성
CREATE INDEX idx_receipt_purchase_date ON receipts(purchase_date);
CREATE INDEX idx_ingredients_expiry_date ON ingredients(expiry_date);
CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX idx_ingredients_receipt_item_id ON ingredients(receipt_item_id); 