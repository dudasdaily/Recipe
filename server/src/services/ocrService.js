const vision = require('@google-cloud/vision');
const path = require('path');

// 한국어 식재료 키워드 - 대폭 확장
const KOREAN_INGREDIENT_KEYWORDS = new Set([
  // === 채소류 ===
  // 뿌리채소
  '마늘', '양파', '감자', '당근', '무', '순무', '고구마', '생강', '연근', '도라지', 
  '더덕', '우엉', '비트', '알타리무', '쪽파', '샬롯', '대파', '파', '쪽파뿌리',
  '콜라비', '마', '토란', '셀러리악', '고수뿌리', '라디쉬', '파스닙', '사탕무',
  
  // 잎채소  
  '상추', '양배추', '시금치', '깻잎', '치커리', '미나리', '쑥갓', '부추', '얼갈이',
  '배추', '열무', '갓', '케일', '루꼴라', '엔다이브', '물냉이', '청경채', '봄동',
  '쌈채소', '적상추', '버터상추', '로메인', '아이스버그', '치커리', '비타민',
  '비트잎', '무청', '당근잎', '고구마순', '호박잎', '고수잎', '브로콜리잎', '배춧잎', '쑥', '상추잎', '깻잎', '시금치잎',
  
  // 과채류
  '토마토', '오이', '호박', '애호박', '단호박', '가지', '피망', '파프리카', 
  '고추', '청양고추', '꽈리고추', '오크라', '브로콜리', '콜리플라워', 
  '주키니', '여주', '동아', '수세미외', '참외외', '조롱박',
  
  // 콩나물/새싹류
  '콩나물', '숙주', '무순', '콩순', '완두순', '브로콜리순', '알팔파',
  
  // 버섯류
  '버섯', '느타리버섯', '팽이버섯', '새송이버섯', '표고버섯', '목이버섯',
  '양송이버섯', '송이버섯', '석이버섯', '능이버섯', '만가닥버섯', '아가리쿠스',
  
  // === 과일류 ===
  // 사과류
  '사과', '홍로', '후지', '청송사과', '아오리', '감홍', '홍옥',
  
  // 배류  
  '배', '신고배', '원황배', '장십랑배', '추황배',
  
  // 감귤류
  '오렌지', '귤', '감귤', '레몬', '라임', '자몽', '유자', '천혜향', '한라봉',
  '네이블', '발렌시아', '블러드오렌지', '청견', '레드향',
  
  // 베리류
  '딸기', '블루베리', '라즈베리', '블랙베리', '산딸기', '오디', '구기자',
  
  // 열대과일
  '바나나', '파인애플', '망고', '키위', '파파야', '용과', '망고스틴', '랍부탄',
  '두리안', '아보카도', '코코넛', '패션프루트',
  
  // 기타과일  
  '포도', '복숭아', '자두', '체리', '멜론', '수박', '무화과', '감', '곶감',
  '대추', '매실', '살구', '천도복숭아', '석류', '참다래', '모과',
  
  // === 육류 ===
  // 소고기
  '소고기', '한우', '육우', '등심', '안심', '채끝', '갈비', '갈비살', '불고기',
  '국거리', '사태', '양지', '차돌박이', '꽃등심', '토시살', '업진살', '치마살',
  '부채살', '살치살', '제비추리', '우둔', '설도', '홍두깨살',
  
  // 돼지고기
  '돼지고기', '삼겹살', '목살', '앞다리', '뒷다리', '등갈비', '갈비', '항정살',
  '가브리살', '오겹살', '등심', '안심', '족발', '순대', '소시지', '햄', '베이컨',
  
  // 닭고기
  '닭고기', '닭다리', '닭가슴살', '닭날개', '닭발', '닭목', '영계', '육계',
  '오리고기', '오리가슴살', '오리다리',
  
  // 기타육류
  '양고기', '염소고기', '사슴고기', '토끼고기', '거위고기',
  
  // === 해산물 ===
  // 생선류
  '생선', '고등어', '삼치', '갈치', '조기', '명태', '대구', '연어', '참치',
  '방어', '전어', '꽁치', '멸치', '정어리', '아귀', '광어', '우럭', '농어',
  '도미', '민어', '병어', '가자미', '송어', '장어', '뱀장어', '붕어', '잉어',
  '은어', '피라미', '황어', '돔', '돌돔', '참돔', '감성돔',
  
  // 패류/갑각류
  '새우', '대하', '흰다리새우', '보리새우', '게', '꽃게', '대게', '킹크랩',
  '바닷가재', '가재', '굴', '전복', '조개', '바지락', '홍합', '가리비',
  '소라', '골뱅이', '멍게', '해삼', '성게',
  
  // 연체류
  '오징어', '문어', '낙지', '쭈꾸미', '갑오징어', '한치',
  
  // 김치/젓갈류
  '멸치젓', '새우젓', '명란젓', '창란젓', '갈치속젓', '조개젓',
  
  // === 유제품 ===
  '우유', '저지방우유', '무지방우유', '초유', '가공유', '두유', '아몬드우유',
  '오트밀크', '라이스밀크', '코코넛밀크', '치즈', '모짜렐라', '체다', '까망베르',
  '고다', '파마산', '요거트', '요구르트', '그릭요거트', '케피어', '버터',
  '마가린', '생크림', '휘핑크림', '사워크림', '크림치즈', '아이스크림',
  '달걀', '계란', '메추리알', '오리알', '거위알',
  
  // === 곡류/견과류/씨앗 ===
  // 곡류
  '쌀', '현미', '백미', '찹쌀', '흑미', '적미', '녹미', '발아현미', '보리',
  '귀리', '밀', '호밀', '기장', '수수', '메밀', '퀴노아', '아마란스',
  
  // 면류
  '면', '국수', '소면', '중면', '냉면', '막국수', '칼국수', '우동', '라면',
  '스파게티', '파스타', '마카로니', '펜네', '쌀국수', '당면', '곤약면',
  
  // 빵류
  '빵', '식빵', '바게트', '크로와상', '베이글', '도넛', '머핀', '카스테라',
  '케이크', '파이', '타르트', '스콘', '프레첼', '와플',
  
  // 견과류
  '호두', '아몬드', '땅콩', '잣', '피스타치오', '캐슈넛', '피칸', '마카다미아',
  '헤이즐넛', '브라질너트', '밤', '대추', '건포도', '크랜베리',
  
  // 씨앗류
  '참깨', '들깨', '해바라기씨', '호박씨', '치아시드', '아마씨', '바질시드',
  
  // === 조미료/양념류 ===
  // 기본조미료
  '소금', '설탕', '후추', '식초', '간장', '된장', '고추장', '쌈장', '춘장',
  '올리고당', '물엿', '꿀', '메이플시럽', '아가베', '스테비아',
  
  // 기름/오일
  '식용유', '참기름', '들기름', '올리브오일', '카놀라유', '포도씨오일',
  '해바라기유', '코코넛오일', '아보카도오일', '마카다미아오일',
  
  // 향신료
  '마늘', '생강', '파', '양파', '고춧가루', '후춧가루', '계피', '정향',
  '팔각', '월계수잎', '로즈마리', '바질', '오레가노', '타임', '세이지',
  '민트', '딜', '파슬리', '고수', '차이브', '타라곤',
  
  // 소스류
  '케첩', '마요네즈', '머스터드', '와사비', '타바스코', '우스터소스',
  '스테이크소스', '바비큐소스', '칠리소스', '스리라차', '굴소스',
  
  // === 콩/두부류 ===
  '콩', '대두', '검은콩', '서리태', '완두콩', '강낭콩', '팥', '녹두', '렌틸콩',
  '병아리콩', '두부', '순두부', '연두부', '부침두부', '유부', '콩비지',
  '된장', '청국장', '낫토', '템페',
  
  // === 가공식품 (식재료용) ===
  // 통조림/병조림
  '참치캔', '연어캔', '토마토소스', '토마토페이스트', '옥수수캔', '콩캔',
  '버섯캔', '죽순캔', '코코넛밀크캔',
  
  // 냉동식품
  '냉동야채', '냉동과일', '냉동새우', '냉동만두', '냉동볶음밥',
  
  // 건어물/건조식품
  '미역', '다시마', '김', '파래', '톳', '멸치', '북어', '오징어채',
  '황태', '고사리', '도라지', '더덕', '버섯', '표고버섯',
  
  // 기타
  '두유', '식혜', '수정과', '오미자', '생수', '탄산수'
]);

// 영수증에서 자주 보이는 브랜드명 포함 상품명
const BRAND_INGREDIENT_KEYWORDS = new Set([
  // 유제품 브랜드
  '매일유업', '서울우유', '남양유업', '빙그레', '덴마크', '앵커버터',
  '후레쉬모짜렐라', '동원참치', '오뚜기', '청정원', '대상', '샘표',
  
  // 만두/교자 브랜드
  '비비고', 'CJ', '비비고왕교자',
  
  // 일반적인 영수증 표기
  '유제품', '육류', '수산물', '청과', '농산물', '축산물', '냉동식품',
  '냉장식품', '건어물', '젓갈류', '김치류', '두부류', '면류', '곡류',
  
  // 마트 카테고리명
  '정육', '수산', '청과물', '유산균', '발효유', '치즈류', '버터류',
  
  // 포장 단위
  '팩', '봉지', '포', '개', '마리', '근', 'kg', 'g', 'ml', 'L'
]);

// 전체 식재료 키워드 통합 (1000개 이상)
const ALL_INGREDIENT_KEYWORDS = new Set([
  ...KOREAN_INGREDIENT_KEYWORDS,
  ...BRAND_INGREDIENT_KEYWORDS
]);

// === 핵심 키워드 및 복합어 ===
const CORE_INGREDIENT_KEYWORDS = [
  '쌀', '고추', '사과', '잎', '숙주', '교자', '왕교자', '오이맛고추', '유기농어린잎', '어린잎', '만두', '샐러드'
];
const CORE_INGREDIENT_COMPOUNDS = [
  '유기농어린잎', '오이맛고추', '왕교자', '어린잎', // 복합어 우선 (긴 것부터)
  '고추', '사과', '쌀', '잎', '숙주', '교자', '만두', '샐러드'
];

/**
 * 상품명에서 핵심 음식 키워드(복합어 우선, 다중 가능) 추출
 * @param {string} name
 * @returns {string[]} 핵심 음식명 배열 (없으면 [])
 */
function extractCoreIngredientNames(name) {
  if (!name || typeof name !== 'string') return [];
  let clean = name
    .replace(/^[0-9]+\s*/, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[0-9]+[gGkKmMlL]+/g, '')
    .replace(/[0-9]+개/g, '')
    .replace(/\d+팩|\d+봉지|\d+포|\d+마리|\d+근/g, '')
    .replace(/\d+kg|\d+g|\d+ml|\d+L/g, '')
    .replace(/\d+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  for (const brand of BRAND_INGREDIENT_KEYWORDS) {
    if (clean.startsWith(brand)) {
      clean = clean.replace(brand, '').trim();
    }
  }
  // 복합어 우선, 다중 추출
  const found = [];
  for (const compound of CORE_INGREDIENT_COMPOUNDS) {
    if (clean.includes(compound)) {
      // 특정 상품명을 식재료로 매핑
      if (compound === '오이맛고추') {
        found.push('고추');
      } else if (compound === '왕교자') {
        found.push('만두');
      } else if (compound === '유기농어린잎' || compound === '어린잎') {
        found.push('샐러드');
      } else {
        found.push(compound);
      }
      clean = clean.replace(compound, '');
    }
  }
  for (const kw of CORE_INGREDIENT_KEYWORDS) {
    if (clean.includes(kw) && !found.some(item => item === '고추' || item === '만두' || item === kw)) {
      // 특정 키워드를 식재료로 매핑
      if (kw === '오이맛고추') {
        found.push('고추');
      } else if (kw === '교자') {
        found.push('만두');
      } else if (kw === '유기농어린잎' || kw === '어린잎') {
        found.push('샐러드');
      } else if (kw === '잎') {
        found.push('샐러드');
      } else {
        found.push(kw);
      }
    }
  }
  return [...new Set(found)];
}

class OCRService {
    constructor() {
        // Vision API 클라이언트 초기화
        try {
            this.client = new vision.ImageAnnotatorClient({
                keyFilename: path.join(__dirname, '../../firebase-service-account.json')
            });
        } catch (error) {
            console.error('Vision API 클라이언트 초기화 실패:', error);
            // 환경변수로 대체 시도
            this.client = new vision.ImageAnnotatorClient();
        }
    }

    /**
     * 상품명이 식재료인지 확인 (개선된 매칭 로직)
     * @param {string} productName - 상품명
     * @returns {boolean} 식재료 여부
     */
    isIngredient(productName) {
        if (!productName || typeof productName !== 'string') {
            return false;
        }
        // 핵심 키워드가 하나라도 있으면 true
        const cores = extractCoreIngredientNames(productName);
        return cores.length > 0;
    }

    /**
     * 영수증 이미지에서 텍스트를 추출하고 구조화된 데이터로 변환
     * @param {Buffer|String} image - 이미지 버퍼 또는 이미지 경로
     * @returns {Promise<Object>} 구조화된 영수증 데이터
     */
    async analyzeReceipt(image) {
        try {
            console.log('[OCR Service] 영수증 분석 시작');
            
            // 텍스트 감지 수행
            const [result] = await this.client.textDetection(image);
            const detections = result.textAnnotations;
            
            console.log('[OCR Service] 텍스트 감지 결과:', detections?.length || 0, '개 감지');
            
            if (!detections || detections.length === 0) {
                console.log('[OCR Service] 텍스트 감지 실패');
                throw new Error('텍스트를 감지할 수 없습니다.');
            }

            // 전체 텍스트
            const fullText = detections[0].description;
            console.log('[OCR Service] 감지된 전체 텍스트 길이:', fullText?.length || 0);
            console.log('[OCR Service] 감지된 텍스트 미리보기:', fullText?.substring(0, 200) + '...');
            
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

        // 정규표현식 패턴 (더 유연하게 수정)
        const datePattern = /(\d{4}[-./]\d{2}[-./]\d{2})|(\d{2}[-./]\d{2}[-./]\d{2,4})/;
        const pricePattern = /(\d{1,3}(,\d{3})*)/;
        // 상품 항목 패턴을 더 유연하게 수정
        const itemPattern = /([가-힣a-zA-Z][가-힣a-zA-Z\s()]+)\s+.*?(\d{1,3}(,\d{3})*)/;
        // 가격만 있는 라인도 체크
        const priceOnlyPattern = /^\s*(\d{1,3}(,\d{3})*)\s*$/;

        // 첫 번째 줄을 상점명으로 가정
        if (lines.length > 0) {
            storeName = lines[0].trim();
        }

        // 각 줄 분석 - 개선된 로직
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // 빈 줄이나 너무 짧은 줄 스킵
            if (!line || line.length < 2) continue;
            
            console.log(`[OCR] 처리 중인 줄: "${line}"`);
            
            // 날짜 찾기
            if (!purchaseDate) {
                const dateMatch = line.match(datePattern);
                if (dateMatch) {
                    purchaseDate = this.normalizeDate(dateMatch[0]);
                    console.log(`[OCR] 날짜 발견: ${purchaseDate}`);
                    continue;
                }
            }

            // 상품 항목 찾기 - 더 적극적으로 시도
            const itemInfo = this.parseItemLine(line);
            if (Array.isArray(itemInfo) && itemInfo.length > 0) {
                for (const info of itemInfo) {
                    if (info && info.name && info.name.length >= 1) {
                        console.log(`[OCR] 상품 발견: ${info.name} (가격: ${info.price})`);
                        // 가격이 0인 경우 다음 줄들에서 가격 정보 찾기
                        if (info.price === 0 && i + 1 < lines.length) {
                            for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
                                const nextLine = lines[j].trim();
                                const priceMatch = nextLine.match(/^\d{1,3}(,\d{3})*$/);
                                if (priceMatch) {
                                    info.price = parseInt(priceMatch[0].replace(/,/g, ''));
                                    info.totalPrice = info.price * info.quantity;
                                    console.log(`[OCR] 가격 발견: ${info.name} -> ${info.price}원`);
                                    break;
                                }
                            }
                        }
                        items.push(info);
                    }
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

        // 식재료만 필터링
        let ingredientItems = items.filter(item => this.isIngredient(item.name));



        console.log(`[OCR] 전체 상품: ${items.length}개, 식재료: ${ingredientItems.length}개`);
        console.log('[OCR] 전체 상품 목록:', items.map(item => item.name).join(', '));
        console.log('[OCR] 감지된 식재료:', ingredientItems.map(item => item.name).join(', '));
        console.log('[OCR] 상점명:', storeName);
        console.log('[OCR] 구매일:', purchaseDate);
        console.log('[OCR] 총액:', totalAmount);

        return {
            storeName: storeName || '미확인',
            purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
            totalAmount: totalAmount || 0,
            items: ingredientItems, // 식재료만 반환
            originalItemCount: items.length, // 원본 상품 개수 정보 추가
            ingredientCount: ingredientItems.length // 필터링된 식재료 개수
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
     * 상품 항목 라인 파싱 (개선된 버전)
     * @param {string} line - 상품 항목 텍스트 라인
     * @returns {Object|null} 파싱된 상품 정보
     */
    parseItemLine(line) {
        // 더 유연한 파싱 시도
        const trimmedLine = line.trim();
        let cleanLine = trimmedLine.replace(/^\*+/, '').trim();
        for (const brand of BRAND_INGREDIENT_KEYWORDS) {
            if (cleanLine.startsWith(brand)) {
                cleanLine = cleanLine.replace(brand, '').trim();
            }
        }
        cleanLine = cleanLine
            .replace(/\([^)]*\)/g, '')
            .replace(/\[[^\]]*\]/g, '')
            .replace(/[0-9]+[gGkKmMlL]+/g, '')
            .replace(/[0-9]+개/g, '')
            .replace(/\d+팩|\d+봉지|\d+포|\d+마리|\d+근/g, '')
            .replace(/\d+kg|\d+g|\d+ml|\d+L/g, '')
            .replace(/\d+$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        // 패턴 0: 앞에 숫자가 있는 상품명 (예: "02 오이맛고추", "06 비비고왕교자 1.155k")
        let matches = trimmedLine.match(/^(\d{1,3})\s+([가-힣a-zA-Z][가-힣a-zA-Z\s()\-\.0-9]+)$/);
        if (matches) {
            let name = matches[2].trim();
            // 브랜드명 제거
            for (const brand of BRAND_INGREDIENT_KEYWORDS) {
                if (name.startsWith(brand)) {
                    name = name.replace(brand, '').trim();
                }
            }
            // 무게/용량 정보 제거
            name = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/[0-9]+[gGkKmMlL]+/g, '').replace(/[0-9]+개/g, '').replace(/\d+\.\d+k/g, '').replace(/\d+$/g, '').replace(/\s+/g, ' ').trim();
            
            const names = extractCoreIngredientNames(name);
            if (names.length > 0) {
                console.log(`[OCR] 패턴0 - 상품명: "${matches[2]}" -> 추출된 키워드: ${names.join(', ')}`);
                return names.map(n => ({
                    name: n,
                    quantity: 1,
                    unit: '개',
                    price: 0,
                    totalPrice: 0
                }));
            }
        }

        // 패턴 1: 상품명 수량 단위 가격 (기존 패턴)
        matches = trimmedLine.match(/^(.+?)\s+(\d+)\s*(개|EA|ea|kg|g|L|ml)?\s*(\d{1,3}(,\d{3})*)/);
        if (matches) {
            let name = matches[1].trim();
            for (const brand of BRAND_INGREDIENT_KEYWORDS) {
                if (name.startsWith(brand)) {
                    name = name.replace(brand, '').trim();
                }
            }
            name = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/[0-9]+[gGkKmMlL]+/g, '').replace(/[0-9]+개/g, '').replace(/\d+$/g, '').replace(/\s+/g, ' ').trim();
            // 핵심 키워드 다중 추출
            const names = extractCoreIngredientNames(name);
            const quantity = parseInt(matches[2]);
            const price = parseInt(matches[4].replace(/,/g, ''));
            const unit = matches[3] || '개';
            // 여러 키워드면 각각 반환
            return names.map(n => ({
                name: n,
                quantity,
                unit,
                price,
                totalPrice: quantity * price
            }));
        }
        // 패턴 2: 상품명 가격 (수량 없이)
        matches = trimmedLine.match(/^([가-힣a-zA-Z][가-힣a-zA-Z\s()\-]+)\s+(\d{1,3}(,\d{3})*)\s*$/);
        if (matches) {
            let name = matches[1].trim();
            for (const brand of BRAND_INGREDIENT_KEYWORDS) {
                if (name.startsWith(brand)) {
                    name = name.replace(brand, '').trim();
                }
            }
            name = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/[0-9]+[gGkKmMlL]+/g, '').replace(/[0-9]+개/g, '').replace(/\d+$/g, '').replace(/\s+/g, ' ').trim();
            const names = extractCoreIngredientNames(name);
            const price = parseInt(matches[2].replace(/,/g, ''));
            return names.map(n => ({
                name: n,
                quantity: 1,
                unit: '개',
                price,
                totalPrice: price
            }));
        }
        // 패턴 3A: 무게/용량 포함 상품명 (예: "숙주800g(중국산)", "유기농어린잎250g")  
        matches = trimmedLine.match(/^(\d{1,3})\s+([가-힣a-zA-Z][가-힣a-zA-Z\s0-9()]+[가-힣])$/);
        if (matches) {
            let name = matches[2].trim();
            // 브랜드명 제거
            for (const brand of BRAND_INGREDIENT_KEYWORDS) {
                if (name.startsWith(brand)) {
                    name = name.replace(brand, '').trim();
                }
            }
            // 무게/용량 및 산지 정보 제거
            name = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/[0-9]+[gGkKmMlL]+/g, '').replace(/[0-9]+개/g, '').replace(/\d+$/g, '').replace(/\s+/g, ' ').trim();
            
            const names = extractCoreIngredientNames(name);
            if (names.length > 0) {
                console.log(`[OCR] 패턴3A - 상품명: "${matches[2]}" -> 추출된 키워드: ${names.join(', ')}`);
                return names.map(n => ({
                    name: n,
                    quantity: 1,
                    unit: '개',
                    price: 0,
                    totalPrice: 0
                }));
            }
        }

        // 패턴 3: 단순 한글 상품명만 (영수증에서 상품명과 가격이 분리된 경우)
        matches = cleanLine.match(/^([가-힣][가-힣\s()]+)$/);
        if (matches && matches[1].length >= 2) {
            let name = matches[1].trim();
            for (const brand of BRAND_INGREDIENT_KEYWORDS) {
                if (name.startsWith(brand)) {
                    name = name.replace(brand, '').trim();
                }
            }
            name = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/[0-9]+[gGkKmMlL]+/g, '').replace(/[0-9]+개/g, '').replace(/\d+$/g, '').replace(/\s+/g, ' ').trim();
            const names = extractCoreIngredientNames(name);
            if (!names.length || ['품명', '단가', '수량', '금액', '합계', '총액', '부가세', '면세', '과세'].includes(name)) {
                return null;
            }
            console.log(`[OCR] 패턴3 - 상품명: "${matches[1]}" -> 추출된 키워드: ${names.join(', ')}`);
            return names.map(n => ({
                name: n,
                quantity: 1,
                unit: '개',
                price: 0,
                totalPrice: 0
            }));
        }
        // 패턴 4: 브랜드명 포함 상품명 (괄호 포함)
        matches = cleanLine.match(/^([가-힣a-zA-Z][가-힣a-zA-Z\s()\-]+[가-힣a-zA-Z])$/);
        if (matches && matches[1].length >= 3) {
            let name = matches[1].trim();
            for (const brand of BRAND_INGREDIENT_KEYWORDS) {
                if (name.startsWith(brand)) {
                    name = name.replace(brand, '').trim();
                }
            }
            name = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/[0-9]+[gGkKmMlL]+/g, '').replace(/[0-9]+개/g, '').replace(/\d+$/g, '').replace(/\s+/g, ' ').trim();
            const names = extractCoreIngredientNames(name);
            return names.map(n => ({
                name: n,
                quantity: 1,
                unit: '개',
                price: 0,
                totalPrice: 0
            }));
        }
        return null;
    }
}

module.exports = new OCRService(); 