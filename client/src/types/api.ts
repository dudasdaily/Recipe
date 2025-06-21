export type ApiResponse<T> = {
  data: T;
  message: string;
  status: number;
};

export type Ingredient = {
  id: number;
  name: string;
  quantity: number;
  storage_type: 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN';
  expiry_date: string;
  category: string;
  default_expiry_days: number;
  created_at: string;
  updated_at: string;
};

// 영수증 관련 타입들 - design.md 스펙에 맞게 개선
export type Receipt = {
  id: number;
  storeName: string;
  purchaseDate: string;
  totalAmount: number;
  imageUrl: string;
  userId: number;
  created_at: string;
  updated_at: string;
};

export type ReceiptItem = {
  id: number;
  receiptId: number;
  name: string;
  quantity: number;
  unit?: string;
  price: number;
  created_at: string;
  updated_at: string;
};

// 영수증 OCR 응답 타입들
export type OcrReceiptSummary = {
  totalItems: number;
  ingredientItems: number;
  filteredOut: number;
};

export type OcrReceiptResponse = {
  success: true;
  message: string;
  data: {
    receipt: Receipt;
    items: ReceiptItem[];
    summary: OcrReceiptSummary;
  };
};

export type OcrReceiptErrorResponse = {
  success: false;
  message: string;
  error?: string;
};

export type OcrReceiptResult = OcrReceiptResponse | OcrReceiptErrorResponse;

// 저장된 영수증 조회 응답 타입
export type GetReceiptResponse = {
  success: true;
  data: Receipt & {
    items: ReceiptItem[];
  };
};

export type GetReceiptErrorResponse = {
  success: false;
  message: string;
};

export type GetReceiptResult = GetReceiptResponse | GetReceiptErrorResponse;

// 기존 타입 유지
export type RecognizedItem = {
  name: string;
  confidence: number;
  original: string;
}; 