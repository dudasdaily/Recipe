import styled from 'styled-components/native';
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

export const ItemContainer = styled.View`
  background-color: ${colors.white};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid ${colors.border};
`;

export const ItemHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const ItemTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text.primary};
`;

export const DeleteButton = styled.TouchableOpacity`
  padding: 4px;
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