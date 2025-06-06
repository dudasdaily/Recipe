const express = require('express');
const router = express.Router();
const notifyExpiringIngredients = require('../services/expiryNotifier');

router.get('/', async (req, res) => {
  try {
    await notifyExpiringIngredients();
    res.json({ success: true, message: '알림 전송 완료!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
