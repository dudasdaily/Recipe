import { memo, useCallback, useRef, useState } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { ActivityIndicator } from 'react-native';
import { useAnalyzeReceiptMutation } from '@/services/vision/query';
import type { ReceiptScannerProps } from './types';
import {
  Container,
  CameraContainer,
  GuideContainer,
  GuideBox,
  GuideText,
  ControlsContainer,
  CaptureButton,
  CancelButton,
  CancelText,
} from './styles';

export const ReceiptScanner = memo(({
  onScanComplete,
  onCancel,
}: ReceiptScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera>(null);
  const analyzeReceipt = useAnalyzeReceiptMutation();

  const requestPermission = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo.base64) {
        throw new Error('Failed to capture image');
      }

      const result = await analyzeReceipt.mutateAsync({
        imageBase64: photo.base64,
      });

      onScanComplete(
        result.items,
        result.merchantName,
        result.purchaseDate
      );
    } catch (error) {
      console.error('Failed to analyze receipt:', error);
      // TODO: 에러 처리
    }
  }, [onScanComplete, analyzeReceipt]);

  if (hasPermission === null) {
    requestPermission();
    return null;
  }

  if (hasPermission === false) {
    return null; // TODO: 권한 없음 UI 표시
  }

  return (
    <Container>
      <CameraContainer>
        <Camera
          ref={cameraRef}
          type={CameraType.back}
          style={{ flex: 1 }}
        />
        <GuideContainer>
          <GuideBox />
          <GuideText>영수증을 가이드 안에 맞춰주세요</GuideText>
        </GuideContainer>
      </CameraContainer>
      <ControlsContainer>
        <CancelButton onPress={onCancel}>
          <CancelText>취소</CancelText>
        </CancelButton>
        <CaptureButton 
          onPress={handleCapture}
          disabled={analyzeReceipt.isPending}
        >
          {analyzeReceipt.isPending ? (
            <ActivityIndicator color="#000000" />
          ) : null}
        </CaptureButton>
      </ControlsContainer>
    </Container>
  );
});

ReceiptScanner.displayName = 'ReceiptScanner'; 