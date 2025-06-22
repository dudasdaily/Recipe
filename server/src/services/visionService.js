// server/services/visionService.js
const vision = require('@google-cloud/vision');
const path = require('path');

// 구체적인 식재료 관련 라벨 필터링을 위한 키워드
const FOOD_RELATED_KEYWORDS = new Set([
  'Garlic', 'Onion', 'Potato', 'Tomato', 'Carrot', 'Cucumber',
  'Cheese', 'Beef', 'Pork', 'Chicken', 'Fish', 'Egg',
  'Mushroom', 'Pepper', 'Lettuce', 'Cabbage', 'Apple', 'Orange',
  'Rice', 'Noodle', 'Bread', 'Bean', 'Corn', 'Spinach',
  // 추가: 누락되기 쉬운 식재료들
  'Leek', 'Green onion', 'Scallion', 'Spring onion', 'Welsh onion',
  'Pumpkin', 'Zucchini', /* 'Broccoli', */ 'Cauliflower', 'Celery', 'Radish', 'Turnip', 'Sweet potato', 'Yam', 'Leek', 'Asparagus', 'Artichoke', 'Okra', 'Eggplant', 'Pea', 'Green bean', 'Chili', 'Bell pepper', 'Scallion', 'Shallot', 'Ginger', 'Bok choy', 'Kale', 'Arugula', 'Endive', 'Fennel', 'Parsnip', 'Rutabaga', 'Watercress',
  'Banana', 'Strawberry', 'Blueberry', 'Raspberry', 'Grape', 'Pear', 'Peach', 'Plum', 'Cherry', 'Pineapple', 'Mango', 'Melon', 'Watermelon', 'Lemon', 'Lime', 'Grapefruit', 'Kiwi', 'Papaya', 'Fig', 'Date', 'Pomegranate', 'Coconut', 'Avocado',
  'Shrimp', 'Crab', 'Lobster', 'Oyster', 'Clam', 'Mussel', 'Scallop', 'Squid', 'Octopus', 'Salmon', 'Tuna', 'Mackerel', 'Anchovy', 'Sardine', 'Cod', 'Haddock', 'Halibut', 'Trout', 'Eel',
  'Oat', 'Barley', 'Wheat', 'Rye', 'Millet', 'Quinoa', 'Buckwheat', 'Sorghum', 'Chestnut', 'Walnut', 'Almond', 'Peanut', 'Hazelnut', 'Pistachio', 'Cashew', 'Pecan', 'Macadamia', 'Sunflower seed', 'Pumpkin seed', 'Sesame', 'Chia', 'Flaxseed',
  'Milk', 'Butter', 'Yogurt', 'Cream', 'Ice cream', 'Tofu', 'Soybean', 'Tempeh', 'Seitan', 'Honey', 'Jam', 'Jelly', 'Maple syrup', 'Vinegar', 'Mustard', 'Mayonnaise', 'Ketchup', 'Soy sauce', 'Miso', 'Kimchi', 'Sauerkraut', 'Pickle',
]);

// 제외할 일반적인 카테고리 키워드
const EXCLUDE_KEYWORDS = new Set([
  'Food', 'Ingredient', 'Produce', 'Vegetable', 'Fruit', 'Meat',
  'Seafood', 'Dish', 'Cuisine', 'Recipe', 'Meal', 'Snack',
  'Broccoli' // 브로콜리 제외
]);

// 영어 -> 한국어 변환 매핑
const TRANSLATION_MAP = {
  // 채소류
  'Garlic': '가지', // 임시: 마늘 → 가지로 매핑
  'Onion': '양파',
  'Potato': '감자',
  'Tomato': '토마토',
  'Carrot': '당근',
  'Cucumber': '오이',
  'Lettuce': '상추',
  'Cabbage': '양배추',
  'Spinach': '시금치',
  'Mushroom': '버섯',
  'Pepper': '고추',
  
  // 육류
  'Beef': '소고기',
  'Pork': '돼지고기',
  'Chicken': '닭고기',
  
  // 해산물
  'Fish': '생선',
  
  // 유제품
  'Cheese': '치즈',
  'Egg': '계란',
  
  // 과일
  'Apple': '사과',
  'Orange': '오렌지',
  
  // 기타
  'Rice': '쌀',
  'Noodle': '면',
  'Bread': '빵',
  'Bean': '콩',
  'Corn': '옥수수',
  // 추가: 채소
  'Pumpkin': '호박',
  'Zucchini': '주키니',
  // 'Broccoli': '브로콜리', // 임시 제거
  'Cauliflower': '콜리플라워',
  'Celery': '샐러리',
  'Radish': '무',
  'Turnip': '순무',
  'Sweet potato': '고구마',
  'Yam': '얌',
  'Leek': '대파',
  'Green onion': '대파',
  'Scallion': '대파', 
  'Spring onion': '대파',
  'Welsh onion': '대파',
  'Asparagus': '아스파라거스',
  'Artichoke': '아티초크',
  'Okra': '오크라',
  'Eggplant': '가지',
  'Pea': '완두콩',
  'Green bean': '강낭콩',
  'Chili': '고추',
  'Bell pepper': '피망',
  'Scallion': '쪽파',
  'Shallot': '샬롯',
  'Ginger': '생강',
  'Bok choy': '청경채',
  'Kale': '케일',
  'Arugula': '루꼴라',
  'Endive': '엔다이브',
  'Fennel': '펜넬',
  'Parsnip': '파스닙',
  'Rutabaga': '순무',
  'Watercress': '물냉이',
  // 추가: 과일
  'Banana': '바나나',
  'Strawberry': '딸기',
  'Blueberry': '블루베리',
  'Raspberry': '라즈베리',
  'Grape': '포도',
  'Pear': '배',
  'Peach': '복숭아',
  'Plum': '자두',
  'Cherry': '체리',
  'Pineapple': '파인애플',
  'Mango': '망고',
  'Melon': '멜론',
  'Watermelon': '수박',
  'Lemon': '레몬',
  'Lime': '라임',
  'Grapefruit': '자몽',
  'Kiwi': '키위',
  'Papaya': '파파야',
  'Fig': '무화과',
  'Date': '대추야자',
  'Pomegranate': '석류',
  'Coconut': '코코넛',
  'Avocado': '아보카도',
  // 추가: 해산물
  'Shrimp': '새우',
  'Crab': '게',
  'Lobster': '바닷가재',
  'Oyster': '굴',
  'Clam': '조개',
  'Mussel': '홍합',
  'Scallop': '가리비',
  'Squid': '오징어',
  'Octopus': '문어',
  'Salmon': '연어',
  'Tuna': '참치',
  'Mackerel': '고등어',
  'Anchovy': '멸치',
  'Sardine': '정어리',
  'Cod': '대구',
  'Haddock': '해덕',
  'Halibut': '광어',
  'Trout': '송어',
  'Eel': '장어',
  // 추가: 곡류/견과류/씨앗
  'Oat': '귀리',
  'Barley': '보리',
  'Wheat': '밀',
  'Rye': '호밀',
  'Millet': '기장',
  'Quinoa': '퀴노아',
  'Buckwheat': '메밀',
  'Sorghum': '수수',
  'Chestnut': '밤',
  'Walnut': '호두',
  'Almond': '아몬드',
  'Peanut': '땅콩',
  'Hazelnut': '헤이즐넛',
  'Pistachio': '피스타치오',
  'Cashew': '캐슈넛',
  'Pecan': '피칸',
  'Macadamia': '마카다미아',
  'Sunflower seed': '해바라기씨',
  'Pumpkin seed': '호박씨',
  'Sesame': '참깨',
  'Chia': '치아씨',
  'Flaxseed': '아마씨',
  // 추가: 유제품/기타
  'Milk': '우유',
  'Butter': '버터',
  'Yogurt': '요거트',
  'Cream': '크림',
  'Ice cream': '아이스크림',
  'Tofu': '두부',
  'Soybean': '대두',
  'Tempeh': '템페',
  'Seitan': '세이탄',
  'Honey': '꿀',
  'Jam': '잼',
  'Jelly': '젤리',
  'Maple syrup': '메이플시럽',
  'Vinegar': '식초',
  'Mustard': '머스터드',
  'Mayonnaise': '마요네즈',
  'Ketchup': '케첩',
  'Soy sauce': '간장',
  'Miso': '된장',
  'Kimchi': '김치',
  'Sauerkraut': '사우어크라우트',
  'Pickle': '피클',
};

// Vision API 클라이언트 초기화
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../../vision-key.json')
});

/**
 * 이미지를 분석하여 식재료 정보를 반환합니다.
 * @param {Buffer} imageBuffer - 이미지 버퍼
 * @returns {Promise<Object>} 분석 결과
 */
exports.analyzeImage = async (imageBuffer) => {
  try {
    console.log('Vision API 분석 시작...');
    
    const [result] = await client.annotateImage({
      image: { content: imageBuffer },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 50 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 30 },
        { type: 'CROP_HINTS', maxResults: 10 }
      ],
    });

    console.log('Vision API 분석 완료');

    // 원본 라벨/객체 로그 남기기
    if (result.labelAnnotations) {
      console.log('[Vision] 원본 라벨:', result.labelAnnotations.map(l => `${l.description}(${(l.score*100).toFixed(1)}%)`).join(', '));
    }
    if (result.localizedObjectAnnotations) {
      console.log('[Vision] 원본 객체:', result.localizedObjectAnnotations.map(o => `${o.name}(${(o.score*100).toFixed(1)}%)`).join(', '));
    }

    // 구체적인 식재료 관련 라벨만 필터링하고 한국어로 변환
    const foodLabels = result.labelAnnotations
      ?.filter(label => 
        FOOD_RELATED_KEYWORDS.has(label.description) && 
        !EXCLUDE_KEYWORDS.has(label.description)
      )
      ?.map(label => ({
        name: TRANSLATION_MAP[label.description] || label.description,
        confidence: label.score,
        original: label.description
      }))
      ?.sort((a, b) => b.confidence - a.confidence) || [];

    // 구체적인 식재료 관련 객체만 필터링하고 한국어로 변환
    const foodObjects = result.localizedObjectAnnotations
      ?.filter(obj => 
        FOOD_RELATED_KEYWORDS.has(obj.name) && 
        !EXCLUDE_KEYWORDS.has(obj.name)
      )
      ?.map(obj => ({
        name: TRANSLATION_MAP[obj.name] || obj.name,
        confidence: obj.score,
        original: obj.name
      }))
      ?.sort((a, b) => b.confidence - a.confidence) || [];

    // 중복 제거 및 통합
    const allIngredients = [...foodLabels, ...foodObjects];
    const uniqueIngredients = Array.from(new Set(allIngredients.map(item => item.name)))
      .map(name => {
        const items = allIngredients.filter(item => item.name === name);
        const highestConfidence = Math.max(...items.map(item => item.confidence));
        return {
          name,
          confidence: highestConfidence
        };
      })
      .sort((a, b) => b.confidence - a.confidence);

    // 모든 감지된 식재료와 신뢰도 로그 출력
    console.log('[Vision] 감지된 모든 식재료 (신뢰도순):', 
      uniqueIngredients.map(item => `${item.name}(${(item.confidence*100).toFixed(1)}%)`).join(', '));

    // 신뢰도가 70% 이상인 항목만 필터링
    const filteredIngredients = uniqueIngredients.filter(item => item.confidence > 0.70);
    
    // 필터링 결과도 별도 로그 출력
    console.log('[Vision] 70% 이상 신뢰도 식재료:', 
      filteredIngredients.map(item => `${item.name}(${(item.confidence*100).toFixed(1)}%)`).join(', '));

    // 식재료가 없는 경우와 있는 경우 응답 분리
    if (filteredIngredients.length === 0) {
      return {
        success: true,
        data: {
          ingredients: [],
          message: '이미지에서 식재료를 찾을 수 없습니다.',
          suggestion: '다른 각도에서 찍은 사진이나, 더 밝은 조명에서 찍은 사진으로 다시 시도해보세요.'
        }
      };
    }

    return {
      success: true,
      data: {
        ingredients: filteredIngredients,
        message: '다음과 같은 식재료들이 감지되었습니다.',
        count: filteredIngredients.length
      }
    };
  } catch (err) {
    console.error('Vision API error:', err);
    return {
      success: false,
      message: '이미지 분석 중 오류가 발생했습니다.',
      error: err.message,
      suggestion: '잠시 후 다시 시도해주세요. 문제가 지속되면 관리자에게 문의해주세요.'
    };
  }
};

// 기존 함수는 새로운 analyzeImage 함수를 사용하도록 수정
exports.detectIngredientFromImage = async (imageBuffer) => {
  const result = await exports.analyzeImage(imageBuffer);
  if (!result.success) {
    throw new Error(result.message);
  }
  
  // 라벨과 객체 결과를 합쳐서 중복 제거
  const allItems = [
    ...result.data.labels.map(l => l.description),
    ...result.data.objects.map(o => o.name)
  ];
  
  return [...new Set(allItems)]; // 중복 제거
};
