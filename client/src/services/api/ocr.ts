import { apiClient } from './client';
import type { 
  OcrReceiptResult, 
  GetReceiptResult 
} from '@/types/api';

/**
 * 영수증 이미지 OCR 처리
 * @param imageUri - 영수증 이미지 URI
 * @returns 영수증 처리 결과 (식재료만 필터링됨)
 */
export const analyzeReceiptImage = async (imageUri: string): Promise<OcrReceiptResult> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    } as any);

    // apiClient를 사용하여 FormData 전송 (인터셉터가 response.data를 반환함)
    const result = await apiClient.post('/ocr/receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return result as unknown as OcrReceiptResult;
  } catch (error) {
    console.error('[OCR Error]', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    
    return {
      success: false,
      message: '영수증 처리 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 저장된 영수증 조회
 * @param receiptId - 영수증 ID
 * @returns 영수증 상세 정보
 */
export const getReceipt = async (receiptId: number): Promise<GetReceiptResult> => {
  try {
    const data = await apiClient.get(`/ocr/receipt/${receiptId}`);
    return data as unknown as GetReceiptResult;
  } catch (error) {
    console.error('[Get Receipt Error]', error);
    
    return {
      success: false,
      message: '영수증을 찾을 수 없습니다.',
    };
  }
};

/**
 * 영수증 목록 조회 (추가 기능)
 * @returns 사용자의 영수증 목록
 */
export const getReceiptList = async () => {
  try {
    const response = await apiClient.get('/ocr/receipts');
    return response;
  } catch (error) {
    console.error('[Get Receipt List Error]', error);
    throw error;
  }
}; 