import { InitializationSingleton } from '../shared';
import type { ImageAnalysisResponse, ReceiptAnalysisResponse } from '@/types/vision';
import type { RecognitionResult } from '@/components/camera/ImageRecognition/types';
import { VISION_API_URL } from '@/config/env';

class VisionServiceAdapter extends InitializationSingleton {
  private baseUrl: string;

  constructor() {
    super();
    this.baseUrl = VISION_API_URL;
  }

  protected async initializeImpl(): Promise<void> {
    // TODO: API 키와 엔드포인트를 환경 변수나 설정에서 가져오기
    if (!this.baseUrl) {
      throw new Error('Vision API 설정이 없습니다.');
    }
  }

  async analyzeImage(imageData: string): Promise<RecognitionResult> {
    await this.ensureInitialized();

    try {
      const response = await fetch(`${this.baseUrl}/vision/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  async analyzeReceipt(imageData: string): Promise<RecognitionResult> {
    await this.ensureInitialized();

    try {
      const response = await fetch(`${this.baseUrl}/vision/receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze receipt');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      throw error;
    }
  }

  private processImageAnalysisResponse(rawResponse: any): ImageAnalysisResponse {
    // TODO: API 응답을 RecognizedItem[] 형식으로 변환하는 로직 구현
    return {
      items: rawResponse.items.map((item: any) => ({
        name: item.name,
        confidence: item.confidence,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        storageType: item.storageType,
      })),
      raw: rawResponse,
    };
  }

  private processReceiptAnalysisResponse(rawResponse: any): ReceiptAnalysisResponse {
    // TODO: OCR 응답을 RecognizedItem[] 형식으로 변환하는 로직 구현
    return {
      items: rawResponse.items.map((item: any) => ({
        name: item.name,
        confidence: item.confidence,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
      })),
      merchantName: rawResponse.merchantName,
      purchaseDate: rawResponse.purchaseDate,
      raw: rawResponse,
    };
  }
}

export const VisionService = new VisionServiceAdapter(); 