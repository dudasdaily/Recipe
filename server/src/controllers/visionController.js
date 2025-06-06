const visionService = require('../services/visionService');

/**
 * 이미지 분석 컨트롤러
 */
const visionController = {
  /**
   * 이미지를 분석하여 객체 및 라벨 정보를 반환합니다.
   */
  async analyzeImage(req, res) {
    try {
      console.log('이미지 분석 요청 받음');
      
      // 요청 정보 로깅
      console.log('요청 헤더:', req.headers);
      console.log('파일 정보:', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : '파일 없음');

      // 이미지 파일 체크
      if (!req.file) {
        console.log('이미지 파일이 없음');
        return res.status(400).json({
          success: false,
          message: '이미지 파일이 필요합니다.',
        });
      }

      console.log('Vision Service 호출 시작...');
      // 이미지 분석 수행
      const result = await visionService.analyzeImage(req.file.buffer);
      console.log('Vision Service 호출 완료');
      
      // 결과 반환
      console.log('분석 결과 반환');
      res.json(result);
    } catch (error) {
      console.error('컨트롤러 에러 상세 정보:');
      console.error('- 에러 메시지:', error.message);
      console.error('- 에러 스택:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message || '서버 오류가 발생했습니다.',
      });
    }
  },
};

module.exports = visionController; 