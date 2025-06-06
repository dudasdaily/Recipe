const express = require("express");
const router = express.Router();
const sendNotification = require("../services/sendNotification");

router.post("/", async (req, res) => {
  const { token, title, body } = req.body;

  try {
    const result = await sendNotification(token, title, body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
