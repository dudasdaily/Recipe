import { useMutation } from '@tanstack/react-query';
import { VisionService } from './adapter';
import type { ImageAnalysisResponse, ReceiptAnalysisResponse } from '@/types/vision';

type AnalyzeImageParams = {
  imageBase64: string;
};

type AnalyzeReceiptParams = {
  imageBase64: string;
};

export const visionKeys = {
  all: () => ['vision'] as const,
  analyzeImage: () => [...visionKeys.all(), 'analyzeImage'] as const,
  analyzeReceipt: () => [...visionKeys.all(), 'analyzeReceipt'] as const,
} as const;

export const useAnalyzeImageMutation = () => {
  return useMutation<ImageAnalysisResponse, Error, AnalyzeImageParams>({
    mutationKey: visionKeys.analyzeImage(),
    mutationFn: ({ imageBase64 }) => VisionService.analyzeImage(imageBase64),
  });
};

export const useAnalyzeReceiptMutation = () => {
  return useMutation<ReceiptAnalysisResponse, Error, AnalyzeReceiptParams>({
    mutationKey: visionKeys.analyzeReceipt(),
    mutationFn: ({ imageBase64 }) => VisionService.analyzeReceipt(imageBase64),
  });
}; 