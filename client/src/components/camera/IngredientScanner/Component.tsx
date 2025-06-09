import { memo, useCallback, useRef, useState } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { ActivityIndicator } from 'react-native';
import { useAnalyzeImageMutation } from '@/services/vision/query';
import type { IngredientScannerProps } from './types';
import {
  Container,
  CameraContainer,
  ControlsContainer,
  CaptureButton,
  CancelButton,
  CancelText,
} from './styles';

export const IngredientScanner = memo(({
  onScanComplete,
  onCancel,
  mode,
}: IngredientScannerProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera>(null);
  const analyzeImage = useAnalyzeImageMutation();

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

      const result = await analyzeImage.mutateAsync({
        imageBase64: photo.base64,
      });

      if (mode === 'SINGLE' && result.items.length > 1) {
        // TODO: 모드 전환 모달 표시
        onScanComplete([result.items[0]]);
      } else {
        onScanComplete(result.items);
      }
    } catch (error) {
      console.error('Failed to analyze image:', error);
      // TODO: 에러 처리
    }
  }, [mode, onScanComplete, analyzeImage]);

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
      </CameraContainer>
      <ControlsContainer>
        <CancelButton onPress={onCancel}>
          <CancelText>취소</CancelText>
        </CancelButton>
        <CaptureButton 
          onPress={handleCapture}
          disabled={analyzeImage.isPending}
        >
          {analyzeImage.isPending ? (
            <ActivityIndicator color="#000000" />
          ) : null}
        </CaptureButton>
      </ControlsContainer>
    </Container>
  );
});

IngredientScanner.displayName = 'IngredientScanner'; 