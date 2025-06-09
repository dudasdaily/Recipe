import styled from 'styled-components/native';
import { colors } from '@/styles/theme';

export const Container = styled.View`
  flex-direction: row;
  gap: 8px;
`;

type ButtonProps = {
  isSelected: boolean;
};

export const Button = styled.TouchableOpacity<ButtonProps>`
  flex: 1;
  height: 36px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.isSelected ? colors.primary.main : colors.white};
  border: 1px solid ${props => props.isSelected ? colors.primary.main : colors.border};
`;

export const ButtonText = styled.Text<ButtonProps>`
  font-size: 14px;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
  color: ${props => props.isSelected ? colors.white : colors.text.primary};
`; 