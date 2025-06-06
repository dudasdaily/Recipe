// server/services/visionService.js
const vision = require('@google-cloud/vision');
const path = require('path');

// 구체적인 식재료 관련 라벨 필터링을 위한 키워드
const FOOD_RELATED_KEYWORDS = new Set([
  'Garlic', 'Onion', 'Potato', 'Tomato', 'Carrot', 'Cucumber',
  'Cheese', 'Beef', 'Pork', 'Chicken', 'Fish', 'Egg',
  'Mushroom', 'Pepper', 'Lettuce', 'Cabbage', 'Apple', 'Orange',
  'Rice', 'Noodle', 'Bread', 'Bean', 'Corn', 'Spinach'
]);

// 제외할 일반적인 카테고리 키워드
const EXCLUDE_KEYWORDS = new Set([
  'Food', 'Ingredient', 'Produce', 'Vegetable', 'Fruit', 'Meat',
  'Seafood', 'Dish', 'Cuisine', 'Recipe', 'Meal', 'Snack'
]);

// 영어 -> 한국어 변환 매핑
const TRANSLATION_MAP = {
  // 채소류
  'Garlic': '마늘',
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
  'Corn': '옥수수'
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
        { type: 'LABEL_DETECTION', maxResults: 20 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 20 }
      ],
    });

    console.log('Vision API 분석 완료');

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

    // 신뢰도가 50% 이상인 항목만 필터링
    const filteredIngredients = uniqueIngredients.filter(item => item.confidence > 0.5);

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
