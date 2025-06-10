import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export async function analyzeReceiptImage(imageUri: string): Promise<any> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: 'receipt.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await axios.post(`${API_BASE_URL}/ocr/receipt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
} 