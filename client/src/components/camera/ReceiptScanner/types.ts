import type { RecognizedItem } from '@/types/vision';

export type ReceiptScannerProps = {
  onScanComplete: (items: RecognizedItem[], merchantName?: string, purchaseDate?: string) => void;
  onCancel: () => void;
}; 