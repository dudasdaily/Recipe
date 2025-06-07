import { useState, useCallback } from 'react';
import { launchCameraAsync, MediaTypeOptions } from 'expo-image-picker';
import { visionService } from '@/services/vision/adapter';
import type { AddMode } from '@/types/ingredient';
import type { RecognitionResult } from '@/components/camera/ImageRecognition/types';

export const useImageRecognition = (mode: AddMode) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult>();

  const handleCapture = useCallback(async () => {
    try {
      setIsProcessing(true);

      const result = await launchCameraAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const imageData = result.assets[0].base64;
        const recognitionResult = mode === 'SINGLE'
          ? await visionService.analyzeImage(imageData)
          : await visionService.analyzeReceipt(imageData);

        setRecognitionResult(recognitionResult);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      // TODO: 에러 처리
    } finally {
      setIsProcessing(false);
    }
  }, [mode]);

  const clearRecognitionResult = useCallback(() => {
    setRecognitionResult(undefined);
  }, []);

  return {
    isProcessing,
    recognitionResult,
    handleCapture,
    clearRecognitionResult,
  };
}; 