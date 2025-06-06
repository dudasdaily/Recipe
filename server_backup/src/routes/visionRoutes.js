const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionController = require('../controllers/visionController');

// 메모리에 이미지를 임시 저장하는 multer 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일 형식 체크
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
    cb(null, true);
  },
});

// Multer 에러 처리 미들웨어
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer 관련 에러 처리
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '파일 크기는 5MB를 초과할 수 없습니다.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: '이미지 파일은 "image" 필드로 전송해야 합니다.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `파일 업로드 오류: ${err.message}`,
    });
  }
  // 일반 에러
  if (err) {
    return res.status(500).json({
      success: false,
      message: err.message || '서버 오류가 발생했습니다.',
    });
  }
  next();
};

// 이미지 분석 엔드포인트
router.post('/analyze', 
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        handleMulterError(err, req, res, next);
      } else {
        next();
      }
    });
  },
  visionController.analyzeImage
);

module.exports = router; 