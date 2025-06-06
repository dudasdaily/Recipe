const FCMToken = require("../models/FCMToken");

exports.registerToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "FCM 토큰이 필요합니다" });
  }

  try {
    await FCMToken.insert(token);
    res.json({ success: true, message: "토큰 저장 완료" });
  } catch (error) {
    console.error("❌ 토큰 저장 오류:", error);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};
