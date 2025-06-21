import { apiClient } from './client';

export async function analyzeIngredientImage(imageUri: string): Promise<any> {
  const formData = new FormData();
  // expo-image-picker의 uri는 file://... 형태이므로, name과 type을 지정해야 함
  formData.append('image', {
    uri: imageUri,
    name: 'ingredient.jpg',
    type: 'image/jpeg',
  } as any);

  const result = await apiClient.post('/vision/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return result;
} 