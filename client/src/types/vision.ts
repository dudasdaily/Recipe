export type RecognizedItem = {
  id?: string;
  name: string;
  confidence: number;
  quantity?: string;
  expiryDate?: string;
  storageType?: 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN';
};

export type ImageAnalysisResponse = {
  items: RecognizedItem[];
  raw?: any; // Vision API의 원본 응답
};

export type ReceiptAnalysisResponse = {
  items: RecognizedItem[];
  merchantName?: string;
  purchaseDate?: string;
  raw?: any; // OCR API의 원본 응답
}; 