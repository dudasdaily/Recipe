import type { RecognizedItem } from '@/components/camera/ImageRecognition/types';

export type ModeTransitionModalProps = {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  recognizedItems?: RecognizedItem[];
}; 