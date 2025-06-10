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

function isValidDateString(dateStr) {
  // YYYY-MM-DD 형식 체크 및 실제 날짜인지 확인
  return (
    typeof dateStr === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateStr) &&
    !isNaN(Date.parse(dateStr))
  );
}

// [POST] 재료 추가
router.post('/', async (req, res) => {
  // 요청 데이터 로그
  console.log('[재료 추가 요청] req.body:', req.body);
  const { name, quantity, expiry_date } = req.body;
  if (!name) {
    return res.status(400).json({ error: '이름은 필수입니다.' });
  }

  // 빈 문자열, undefined, null, 잘못된 날짜, 'Invalid date' 모두 null로 변환
  let expiryValue = null;
  if (
    expiry_date &&
    typeof expiry_date === 'string' &&
    expiry_date.trim() !== '' &&
    expiry_date !== 'Invalid date'
  ) {
    expiryValue = isValidDateString(expiry_date) ? expiry_date : null;
  }

  try {
    const [result] = await db.query(
      'INSERT INTO ingredients (name, quantity, expiry_date) VALUES (?, ?, ?)',
      [name, quantity || null, expiryValue]
    );
    res.json({ message: '재료 추가 완료', id: result.insertId });
  } catch (err) {
    console.error('재료 추가 실패:', err);
    res.status(500).json({ error: 'DB 오류' });
  }
});

module.exports = router;
