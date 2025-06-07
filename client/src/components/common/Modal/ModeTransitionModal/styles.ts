import styled from 'styled-components/native';
import { colors } from '@/styles/theme';

export const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const ModalContent = styled.View`
  width: 280px;
  max-height: 400px;
  background-color: ${colors.white};
  border-radius: 12px;
  padding: 20px;
`;

export const ModalScrollContent = styled.ScrollView`
  flex-grow: 0;
  max-height: 300px;
`;

export const ModalTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colors.text.primary};
  margin-bottom: 12px;
`;

export const ModalMessage = styled.Text`
  font-size: 14px;
  color: ${colors.text.secondary};
  margin-bottom: 8px;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

type ButtonVariant = 'primary' | 'secondary';

export const Button = styled.TouchableOpacity<{ variant: ButtonVariant }>`
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.variant === 'primary' ? colors.primary.main : colors.white};
  border: ${props => props.variant === 'secondary' ? `1px solid ${colors.border}` : 'none'};
`;

export const ButtonText = styled.Text<{ variant: ButtonVariant }>`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.variant === 'primary' ? colors.white : colors.text.secondary};
`; 