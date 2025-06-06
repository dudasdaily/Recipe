const vision = require('@google-cloud/vision');
const fs = require('fs').promises;
const path = require('path');

// 제외할 일반 카테고리 키워드
const EXCLUDE_GENERAL_CATEGORIES = [
  'Food', 'Ingredient', 'Vegetable', 'Fruit', 'Meat', 'Seafood',
  'Produce', 'Spice', 'Herb', 'Grain', 'Dairy', 'Beverage',
  'Food group', 'Natural foods', 'Cuisine', 'Dish', 'Meal'
];

// 음식 관련 키워드 정의 (구체적인 재료 위주)
const FOOD_RELATED_KEYWORDS = [
  // 채소류
  'Tomato', 'Potato', 'Onion', 'Garlic', 'Carrot', 'Lettuce', 'Cucumber',
  'Cabbage', 'Broccoli', 'Spinach', 'Pepper', 'Mushroom', 'Eggplant',
  'Sweet potato', 'Pumpkin', 'Zucchini', 'Radish', 'Green onion',
  
  // 과일류
  'Apple', 'Banana', 'Orange', 'Grape', 'Strawberry', 'Peach', 'Pear',
  'Pineapple', 'Watermelon', 'Kiwi', 'Mango', 'Lemon', 'Blueberry',
  
  // 육류
  'Beef', 'Pork', 'Chicken', 'Duck', 'Lamb', 'Turkey',
  
  // 해산물
  'Fish', 'Shrimp', 'Crab', 'Squid', 'Octopus', 'Salmon', 'Tuna',
  
  // 기타 재료
  'Rice', 'Egg', 'Milk', 'Cheese', 'Bread', 'Noodle', 'Tofu',
  'Bean', 'Corn', 'Flour', 'Sugar', 'Salt'
];

// 영어-한글 변환 사전
const LABEL_TRANSLATIONS = {
  // 채소류
  'Tomato': '토마토',
  'Potato': '감자',
  'Onion': '양파',
  'Garlic': '마늘',
  'Carrot': '당근',
  'Lettuce': '상추',
  'Cucumber': '오이',
  'Cabbage': '양배추',
  'Broccoli': '브로콜리',
  'Spinach': '시금치',
  'Pepper': '고추',
  'Mushroom': '버섯',
  'Eggplant': '가지',
  'Sweet potato': '고구마',
  'Pumpkin': '호박',
  'Zucchini': '애호박',
  'Radish': '무',
  'Green onion': '파',
  
  // 과일류
  'Apple': '사과',
  'Banana': '바나나',
  'Orange': '오렌지',
  'Grape': '포도',
  'Strawberry': '딸기',
  'Peach': '복숭아',
  'Pear': '배',
  'Pineapple': '파인애플',
  'Watermelon': '수박',
  'Kiwi': '키위',
  'Mango': '망고',
  'Lemon': '레몬',
  'Blueberry': '블루베리',
  
  // 육류
  'Beef': '소고기',
  'Pork': '돼지고기',
  'Chicken': '닭고기',
  'Duck': '오리고기',
  'Lamb': '양고기',
  'Turkey': '칠면조고기',
  
  // 해산물
  'Fish': '생선',
  'Shrimp': '새우',
  'Crab': '게',
  'Squid': '오징어',
  'Octopus': '문어',
  'Salmon': '연어',
  'Tuna': '참치',
  
  // 기타 재료
  'Rice': '쌀',
  'Egg': '계란',
  'Milk': '우유',
  'Cheese': '치즈',
  'Bread': '빵',
  'Noodle': '면',
  'Tofu': '두부',
  'Bean': '콩',
  'Corn': '옥수수',
  'Flour': '밀가루',
  'Sugar': '설탕',
  'Salt': '소금'
};

class VisionService {
  constructor() {
    console.log('Vision Service 초기화 시작...');
    try {
      this.client = new vision.ImageAnnotatorClient({
        keyFilename: path.join(__dirname, '../../vision-key.json')
      });
      console.log('Vision API 클라이언트 초기화 성공');
    } catch (error) {
      console.error('Vision API 클라이언트 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 라벨이 음식 관련 키워드인지 확인하고 일반 카테고리가 아닌지 확인
   * @param {string} label - 확인할 라벨
   * @returns {boolean} 구체적인 음식 재료 여부
   */
  isFoodRelated(label) {
    // 일반 카테고리 제외
    if (EXCLUDE_GENERAL_CATEGORIES.includes(label)) {
      return false;
    }
    
    // 구체적인 재료 확인
    return FOOD_RELATED_KEYWORDS.some(keyword => 
      label.toLowerCase() === keyword.toLowerCase()
    );
  }

  /**
   * 영어 라벨을 한글로 변환
   * @param {string} label - 변환할 영어 라벨
   * @returns {string} 한글로 변환된 라벨 또는 원본 라벨
   */
  translateLabel(label) {
    return LABEL_TRANSLATIONS[label] || label;
  }

  /**
   * 신뢰도에 따라 결과를 분류합니다.
   * @param {Array} labels - 감지된 라벨 배열
   * @returns {Object} 신뢰도별로 분류된 결과
   */
  classifyByConfidence(labels) {
    const HIGH_CONFIDENCE = 0.8;   // 80% 이상
    const MID_CONFIDENCE = 0.6;    // 60% 이상

    return {
      highConfidence: labels.filter(label => label.confidence >= HIGH_CONFIDENCE),
      mediumConfidence: labels.filter(label => label.confidence >= MID_CONFIDENCE && label.confidence < HIGH_CONFIDENCE),
      lowConfidence: labels.filter(label => label.confidence < MID_CONFIDENCE)
    };
  }

  /**
   * 이미지에서 감지된 일반적인 객체들을 반환합니다.
   * @param {Array} labels - Vision API가 감지한 전체 라벨
   * @returns {Array} 상위 5개의 일반 객체
   */
  getGeneralObjects(labels) {
    return labels
      .filter(label => !this.isFoodRelated(label.description) && 
                      !EXCLUDE_GENERAL_CATEGORIES.includes(label.description))
      .slice(0, 5)
      .map(label => ({
        description: label.description,
        confidence: label.score
      }));
  }

  /**
   * 결과에 대한 상세 메시지를 생성합니다.
   * @param {Object} classified - 신뢰도별로 분류된 결과
   * @param {Array} generalObjects - 감지된 일반 객체들
   * @returns {Object} 상세 메시지와 추천 사항
   */
  generateDetailedMessage(classified, generalObjects = []) {
    const { highConfidence, mediumConfidence, lowConfidence } = classified;
    
    // 음식이 감지되지 않은 경우
    if (highConfidence.length === 0 && mediumConfidence.length === 0 && lowConfidence.length === 0) {
      const detectedObjects = generalObjects
        .map(obj => obj.description)
        .join(', ');

      return {
        mainMessage: '식재료를 찾을 수 없습니다.',
        details: detectedObjects 
          ? `대신 다음과 같은 객체가 감지되었습니다: ${detectedObjects}`
          : '어떤 객체도 명확하게 감지되지 않았습니다.',
        suggestions: [
          '사진을 더 가까이에서 촬영해보세요.',
          '조명이 더 밝은 곳에서 시도해보세요.',
          '다른 각도에서 촬영해보세요.',
          '식재료가 잘 보이도록 배경을 정리해보세요.',
          '한 번에 너무 많은 재료를 찍지 말고, 주요 재료를 중심으로 촬영해보세요.'
        ]
      };
    }

    // 음식이 감지된 경우 (기존 로직)
    const messages = [];
    
    if (highConfidence.length > 0) {
      const items = highConfidence.map(label => label.description).join(', ');
      messages.push(`확실한 재료: ${items}`);
    }
    
    if (mediumConfidence.length > 0) {
      const items = mediumConfidence.map(label => label.description).join(', ');
      messages.push(`추정되는 재료: ${items}`);
    }
    
    if (lowConfidence.length > 0) {
      const items = lowConfidence.map(label => label.description).join(', ');
      messages.push(`불확실한 재료: ${items}`);
    }

    return {
      mainMessage: `${highConfidence.length + mediumConfidence.length + lowConfidence.length}개의 식재료가 감지되었습니다.`,
      details: messages.join('\n'),
      suggestions: lowConfidence.length > 0 ? [
        '불확실한 재료는 다른 각도에서 다시 촬영해보세요.',
        '조명이 더 밝은 환경에서 시도해보세요.'
      ] : []
    };
  }

  /**
   * 이미지를 분석하여 객체 감지 및 라벨 정보를 반환합니다.
   * @param {Buffer} imageBuffer - 이미지 버퍼
   * @returns {Promise<Object>} 분석 결과
   */
  async analyzeImage(imageBuffer) {
    try {
      console.log('이미지 분석 시작...');
      console.log('이미지 버퍼 크기:', imageBuffer.length, 'bytes');

      const tempFilePath = `temp_${Date.now()}.jpg`;
      await fs.writeFile(tempFilePath, imageBuffer);
      
      console.log('Vision API 요청 시작...');
      
      const [result] = await this.client.annotateImage({
        image: { source: { filename: tempFilePath } },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 30 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 20 }
        ]
      });

      await fs.unlink(tempFilePath);
      
      console.log('Vision API 응답 받음');

      // 구체적인 음식 재료 필터링
      const foodLabels = (result.labelAnnotations || [])
        .filter(label => this.isFoodRelated(label.description))
        .map(label => ({
          description: this.translateLabel(label.description),
          confidence: label.score,
          originalLabel: label.description
        }))
        .sort((a, b) => b.confidence - a.confidence);

      // 일반 객체 가져오기
      const generalObjects = this.getGeneralObjects(result.labelAnnotations || []);

      // 신뢰도별로 분류
      const classifiedResults = this.classifyByConfidence(foodLabels);
      
      // 상세 메시지 생성
      const messageData = this.generateDetailedMessage(classifiedResults, generalObjects);

      console.log('분석 결과:', { 
        totalLabels: result.labelAnnotations?.length || 0,
        foodLabels: foodLabels.length,
        highConfidence: classifiedResults.highConfidence.length,
        mediumConfidence: classifiedResults.mediumConfidence.length,
        lowConfidence: classifiedResults.lowConfidence.length
      });

      return {
        success: true,
        foodIngredients: foodLabels,
        classifiedResults: {
          highConfidence: classifiedResults.highConfidence,
          mediumConfidence: classifiedResults.mediumConfidence,
          lowConfidence: classifiedResults.lowConfidence
        },
        generalObjects: generalObjects,
        totalCount: foodLabels.length,
        mainMessage: messageData.mainMessage,
        details: messageData.details,
        suggestions: messageData.suggestions
      };

    } catch (error) {
      console.error('Vision API 에러 상세 정보:');
      console.error('- 에러 메시지:', error.message);
      console.error('- 전체 에러:', error);
      
      try {
        await fs.unlink(tempFilePath);
      } catch (e) {
        // 파일이 없거나 삭제 실패해도 무시
      }
      
      return {
        success: false,
        error: error.message,
        mainMessage: '이미지 분석 중 오류가 발생했습니다.',
        details: '다시 시도해주세요.',
        suggestions: [
          '네트워크 연결을 확인해주세요.',
          '지원되는 이미지 형식인지 확인해주세요. (JPG, PNG)',
          '이미지 크기가 너무 크지 않은지 확인해주세요.',
          '잠시 후 다시 시도해주세요.'
        ]
      };
    }
  }
}

module.exports = new VisionService(); 