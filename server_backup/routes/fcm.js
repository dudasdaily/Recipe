const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcmController");
const db = require("../db");

router.post("/register", fcmController.registerToken);

router.post('/set-time', async (req, res) => {
  const { token, time } = req.body;

  if (!token || !time) {
    return res.status(400).json({ success: false, message: "token과 time이 필요합니다." });
  }

  try {
    await db.query(
      `UPDATE fcm_tokens SET notify_time = ? WHERE token = ?`,
      [time, token]
    );
    res.json({ success: true, message: `알림 시간 설정 완료: ${time}` });
  } catch (err) {
    res.status(500).json({ success: false, message: "DB 오류", detail: err.message });
  }
});

module.exports = router;
