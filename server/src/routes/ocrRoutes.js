const express = require('express');
const multer = require('multer');
const ocrController = require('../controllers/ocrController');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
    }
});

// 영수증 이미지 분석
router.post('/receipt', upload.single('image'), ocrController.analyzeReceipt);

// 저장된 영수증 조회
router.get('/receipt/:id', ocrController.getReceipt);

module.exports = router; 