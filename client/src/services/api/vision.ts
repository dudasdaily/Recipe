import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export async function analyzeIngredientImage(imageUri: string): Promise<any> {
  const formData = new FormData();
  // expo-image-picker의 uri는 file://... 형태이므로, name과 type을 지정해야 함
  formData.append('image', {
    uri: imageUri,
    name: 'ingredient.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await axios.post(`${API_BASE_URL}/vision/analyze`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
} 