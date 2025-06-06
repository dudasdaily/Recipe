const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    // 1. 유통기한 임박 재료 (3일 이내)
    const [urgentRows] = await db.query(`
      SELECT name FROM ingredients
      WHERE DATEDIFF(expiry_date, CURDATE()) BETWEEN 0 AND 3
    `);
    const urgentIngredients = urgentRows.map(row => row.name);

    // 2. 전체 재료
    const [allRows] = await db.query(`SELECT name FROM ingredients`);
    const allIngredients = allRows.map(row => row.name);

    // 3. 기타 재료 = 전체 재료 - 임박 재료
    const otherIngredients = allIngredients.filter(name => !urgentIngredients.includes(name));

 const prompt = `지금부터 모든 대답은 **한국어로만** 해주세요.  
형식 외의 부가적인 설명은 절대 하지 마세요.

냉장고 속 재료를 기반으로 요리를 추천해주세요.  
유통기한 임박 재료를 **우선 사용**해주세요.

- 유통기한 임박 재료: ${urgentIngredients.length > 0 ? urgentIngredients.join(', ') : '없음'}
- 기타 재료: ${otherIngredients.length > 0 ? otherIngredients.join(', ') : '없음'}

없는 재료가 포함된 레시피도 괜찮습니다.  
우선순위는 유통기한 임박 재료를 처리하는 것입니다.

요리는 실제 존재하는 요리여야 하며,  
많은 사람들이 실제로 해먹는 요리만 추천해주세요.  
창작 요리는 절대 추천하지 마세요.

양념 재료(된장, 고추장, 간장 등)는 기본적으로 있다고 가정하세요.

가능한 요리 3가지를 추천해주세요.  
각 요리는 **제목과 간단한 설명**을 아래 형식에 맞춰주세요:

1. [요리 제목]  
   [간단한 설명 한 줄]  
2. [요리 제목]  
   [간단한 설명 한 줄]  
3. [요리 제목]  
   [간단한 설명 한 줄]`;


    // 캐시 확인
    const [logs] = await db.query(
      `SELECT response FROM recommendation_logs WHERE prompt = ? LIMIT 1`,
      [prompt]
    );
    if (logs.length > 0) {
      return res.json({ result: logs[0].response });
    }

    // Groq API 호출
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama3-70b-8192', // 또는 llama3-70b-8192 등
      messages: [
        { role: 'system', content: '당신은 한국말을 사용하는 요리 전문가입니다.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const recipe = response.data.choices[0].message.content;

    // 로그 저장
    await db.query(
      `INSERT INTO recommendation_logs (prompt, response) VALUES (?, ?)`,
      [prompt, recipe]
    );

    res.json({ result: recipe });

  } catch (err) {
    console.error('Groq 호출 오류:', err.response?.data || err.message);
    res.status(500).json({ error: '레시피 추천 실패', detail: err.message });
  }
});

module.exports = router;
