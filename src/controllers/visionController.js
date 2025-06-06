const { detectIngredientFromImage } = require('../services/visionService');

/**
 * 이미지에서 재료 인식 테스트
 */
exports.testVisionAPI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일이 필요합니다.'
      });
    }

    console.log('이미지 파일 받음:', req.file.originalname);
    const ingredients = await detectIngredientFromImage(req.file.buffer);

    res.json({
      success: true,
      data: ingredients
    });
  } catch (error) {
    console.error('Vision API 테스트 실패:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 