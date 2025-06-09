import styled from 'styled-components/native';
import { colors } from '@/styles/theme';

export const Container = styled.View`
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
`;

export const CameraContainer = styled.View`
  flex: 1;
  position: relative;
`;

export const CaptureButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
  align-self: center;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${colors.white};
  justify-content: center;
  align-items: center;
  border: 2px solid ${colors.primary.main};
`;

export const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

export const LoadingText = styled.Text`
  color: ${colors.white};
  font-size: 14px;
  margin-top: 8px;
`;

export const ImagePlaceholder = styled.TouchableOpacity`
  height: 120px;
  background-color: ${colors.gray[100]};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

export const ImagePlaceholderText = styled.Text`
  color: ${colors.text.secondary};
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
`;

export const RecognitionResult = styled.View`
  background-color: ${colors.gray[100]};
  border-radius: 8px;
  padding: 16px;
`;

export const ResultText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 8px;
`;

export const ConfidenceText = styled.Text`
  font-size: 12px;
  color: ${colors.text.secondary};
  margin-bottom: 4px;
`;

export const ConfirmButton = styled.TouchableOpacity`
  height: 24px;
  padding: 0 12px;
  border-radius: 12px;
  background-color: ${colors.primary.main};
  justify-content: center;
  align-items: center;
  align-self: flex-end;
  margin-top: 8px;
`;

export const ConfirmButtonText = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: ${colors.white};
`; 