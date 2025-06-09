import type { AddMode } from '@/types/ingredient';

export type RecognizedItem = {
  name: string;
  quantity?: string;
  unit?: string;
};

export type RecognitionResult = {
  items: RecognizedItem[];
};

export type ImageRecognitionProps = {
  mode: 'SINGLE' | 'MULTI';
  onResult: (result: RecognitionResult) => void;
}; 