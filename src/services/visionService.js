const axios = require('axios');

exports.detectIngredientFromImage = async (imageBuffer) => {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    throw new Error('Google Vision API 키가 설정되지 않았습니다.');
  }

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

  // 이미지 버퍼 → base64로 인코딩
  const base64Image = imageBuffer.toString('base64');

  const requestBody = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
      },
    ],
  };

  try {
    console.log('Vision API 요청 시작...');
    const response = await axios.post(url, requestBody);
    console.log('Vision API 응답 받음');
    
    const labels = response.data.responses[0].labelAnnotations;
    console.log('감지된 라벨:', labels);

    // 상위 라벨 이름만 추출
    const ingredients = labels.map(label => label.description);
    return ingredients;
  } catch (err) {
    console.error('Vision API error:', err.response?.data || err.message);
    throw err;
  }
}; 