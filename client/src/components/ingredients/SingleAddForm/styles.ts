import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { colors } from '@/styles/theme';

export const Container = styled.View`
  flex: 1;
  padding: 16px;
`;

export const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 16px;
`;

export const Section = styled.View`
  margin-bottom: 24px;
`;

export const Label = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: 8px;
`;

export const Input = styled.TextInput`
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  font-size: 14px;
  color: ${colors.text.primary};
`;

export const ImageSection = styled.View`
  margin-bottom: 24px;
`;

export const ImagePlaceholder = styled.TouchableOpacity`
  height: 120px;
  border-radius: 10px;
  border: 1px dashed ${colors.border};
  justify-content: center;
  align-items: center;
  background-color: ${colors.white};
`;

export const ImagePlaceholderText = styled.Text`
  font-size: 12px;
  color: ${colors.text.secondary};
  text-align: center;
  margin-top: 8px;
`;

export const StorageTypeContainer = styled.View`
  flex-direction: row;
  gap: 8px;
`;

export const StorageTypeButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  flex: 1;
  height: 44px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.isSelected ? colors.primary.main : colors.white};
  border: 1px solid ${props => props.isSelected ? colors.primary.main : colors.border};
`;

export const StorageTypeText = styled.Text<{ isSelected: boolean }>`
  font-size: 14px;
  color: ${props => props.isSelected ? colors.white : colors.text.secondary};
`;

export const NotificationRow = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  padding: 0 16px;
  background-color: ${colors.white};
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333333;
`;

export const Row = styled.View`
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;
`;

export const UnitInput = styled(Input)`
  flex: 0.3;
`;

export const DatePickerButton = styled.TouchableOpacity`
  flex: 1;
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border-width: 1px;
  border-color: #E5E5E5;
  justify-content: center;
`;

export const DateText = styled.Text`
  font-size: 14px;
  color: #333333;
`;

export const ImageButton = styled.TouchableOpacity`
  height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  background-color: #F5F5F5;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const ImageButtonText = styled.Text`
  font-size: 14px;
  color: #666666;
`;

export const SaveButton = styled.TouchableOpacity`
  background-color: ${colors.primary.main};
  padding: 16px;
  border-radius: 8px;
  align-items: center;
  margin-top: 24px;
`;

export const SaveButtonText = styled.Text`
  color: ${colors.white};
  font-size: 16px;
  font-weight: bold;
`; 