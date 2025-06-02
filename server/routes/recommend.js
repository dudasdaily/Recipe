// server/routes/recommend.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');
require('dotenv').config();

router.get('/', async (req, res) => {
  try {
    const [ingredients] = await db.query('SELECT name, expiry_date FROM ingredients');

    const now = new Date();
    const urgent = [];
    const normal = [];

    for (const ing of ingredients) {
      const daysLeft = (new Date(ing.expiry_date) - now) / (1000 * 60 * 60 * 24);
      if (daysLeft <= 3) urgent.push(ing.name);
      else normal.push(ing.name);
    }

    const prompt = `냉장고 속 재료를 기반으로 요리를 추천해주세요. 유통기한 임박 재료를 우선 사용해주세요.
- 유통기한 임박 재료: ${urgent.join(', ') || '없음'}
- 기타 재료: ${normal.join(', ') || '없음'}
가능한 요리 3가지 추천해주세요. 각 요리는 제목과 간단한 설명 포함해주세요.`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: '당신은 요리 전문가입니다.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.choices[0].message.content;

    await db.query(
      'INSERT INTO recommendation_logs (prompt, response) VALUES (?, ?)',
      [prompt, result]
    );

    res.json({ result });

  } catch (err) {
    console.error('레시피 추천 오류:', err);
    res.status(500).json({ error: '레시피 추천 실패' });
  }
});

module.exports = router;
