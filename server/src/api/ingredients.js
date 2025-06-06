// server/routes/ingredients.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// [GET] 모든 재료 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ingredients ORDER BY expiry_date ASC');
    res.json(rows);
  } catch (err) {
    console.error('재료 조회 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
});

// [POST] 재료 추가
router.post('/', async (req, res) => {
  const { name, quantity, expiry_date } = req.body;
  if (!name || !expiry_date) {
    return res.status(400).json({ error: '이름과 유통기한은 필수입니다.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO ingredients (name, quantity, expiry_date) VALUES (?, ?, ?)',
      [name, quantity || null, expiry_date]
    );
    res.json({ message: '재료 추가 완료', id: result.insertId });
  } catch (err) {
    console.error('재료 추가 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
});

module.exports = router;
