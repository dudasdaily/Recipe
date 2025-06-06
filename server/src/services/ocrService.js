const vision = require('@google-cloud/vision');
const path = require('path');

class OCRService {
    constructor() {
        // Vision API 클라이언트 초기화
        this.client = new vision.ImageAnnotatorClient({
            keyFilename: path.join(__dirname, '../../vision-key.json')
        });
    }

    /**
     * 영수증 이미지에서 텍스트를 추출하고 구조화된 데이터로 변환
     * @param {Buffer|String} image - 이미지 버퍼 또는 이미지 경로
     * @returns {Promise<Object>} 구조화된 영수증 데이터
     */
    async analyzeReceipt(image) {
        try {
            // 텍스트 감지 수행
            const [result] = await this.client.textDetection(image);
            const detections = result.textAnnotations;
            
            if (!detections || detections.length === 0) {
                throw new Error('텍스트를 감지할 수 없습니다.');
            }

            // 전체 텍스트
            const fullText = detections[0].description;
            
            // 영수증 데이터 파싱
            const receiptData = await this.parseReceiptText(fullText);
            
            return {
                success: true,
                data: receiptData
            };

        } catch (error) {
            console.error('영수증 분석 중 오류:', error);
            return {
                success: false,
                error: error.message || '영수증 분석 중 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 추출된 텍스트에서 영수증 정보 파싱
     * @param {string} text - OCR로 추출된 전체 텍스트
     * @returns {Promise<Object>} 파싱된 영수증 데이터
     */
    async parseReceiptText(text) {
        const lines = text.split('\n');
        const items = [];
        let storeName = '';
        let purchaseDate = null;
        let totalAmount = 0;

        // 정규표현식 패턴
        const datePattern = /(\d{4}[-./]\d{2}[-./]\d{2})|(\d{2}[-./]\d{2}[-./]\d{2,4})/;
        const pricePattern = /(\d{1,3}(,\d{3})*)/;
        const itemPattern = /^[가-힣a-zA-Z\s]+\s+\d+\s*(개|EA|ea)?\s*\d{1,3}(,\d{3})*/;

        // 첫 번째 줄을 상점명으로 가정
        if (lines.length > 0) {
            storeName = lines[0].trim();
        }

        // 각 줄 분석
        for (const line of lines) {
            // 날짜 찾기
            if (!purchaseDate) {
                const dateMatch = line.match(datePattern);
                if (dateMatch) {
                    purchaseDate = this.normalizeDate(dateMatch[0]);
                    continue;
                }
            }

            // 상품 항목 찾기
            const itemMatch = line.match(itemPattern);
            if (itemMatch) {
                const itemInfo = this.parseItemLine(line);
                if (itemInfo) {
                    items.push(itemInfo);
                }
                continue;
            }

            // 총액 찾기 (마지막 가격을 총액으로 가정)
            const priceMatch = line.match(pricePattern);
            if (priceMatch) {
                const possibleTotal = parseInt(priceMatch[0].replace(/,/g, ''));
                if (possibleTotal > totalAmount) {
                    totalAmount = possibleTotal;
                }
            }
        }

        return {
            storeName,
            purchaseDate,
            totalAmount,
            items
        };
    }

    /**
     * 날짜 문자열을 표준 형식으로 변환
     * @param {string} dateStr - 날짜 문자열
     * @returns {string} YYYY-MM-DD 형식의 날짜
     */
    normalizeDate(dateStr) {
        const parts = dateStr.split(/[-./]/);
        let year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');

        // 두 자리 연도를 네 자리로 변환
        if (year.length === 2) {
            year = '20' + year;
        }

        return `${year}-${month}-${day}`;
    }

    /**
     * 상품 항목 라인 파싱
     * @param {string} line - 상품 항목 텍스트 라인
     * @returns {Object|null} 파싱된 상품 정보
     */
    parseItemLine(line) {
        // 상품명과 가격 정보를 분리하는 정규식
        const matches = line.match(/^(.+?)\s+(\d+)\s*(개|EA|ea)?\s*(\d{1,3}(,\d{3})*)/);
        
        if (matches) {
            const name = matches[1].trim();
            const quantity = parseInt(matches[2]);
            const price = parseInt(matches[4].replace(/,/g, ''));
            const unit = matches[3] || '개';

            return {
                name,
                quantity,
                unit,
                price,
                totalPrice: quantity * price
            };
        }

        return null;
    }
}

module.exports = new OCRService(); 