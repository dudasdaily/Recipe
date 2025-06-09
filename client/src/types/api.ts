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
  created_at: string;
  updated_at: string;
};

export type Receipt = {
  id: number;
  storeName: string;
  purchaseDate: string;
  totalAmount: number;
  imageUrl: string;
  items: ReceiptItem[];
};

export type ReceiptItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
};

export type RecognizedItem = {
  name: string;
  confidence: number;
  original: string;
}; 