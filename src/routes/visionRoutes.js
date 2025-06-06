const express = require('express');
const router = express.Router();
const multer = require('multer');
const visionController = require('../controllers/visionController');

// 메모리에 이미지를 임시 저장
const upload = multer({ storage: multer.memoryStorage() });

// 이미지 인식 테스트 엔드포인트
router.post('/test', upload.single('image'), visionController.testVisionAPI);

module.exports = router; 