import styled from 'styled-components/native';
import { colors } from '@/styles/theme';

export const Container = styled.View`
  margin-bottom: 16px;
`;

export const ScrollView = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 16,
    gap: 8,
  },
})``;

export const CategoryButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.isSelected ? colors.primary.main : colors.white};
  border: 1px solid ${props => props.isSelected ? colors.primary.main : colors.border};
`;

export const CategoryText = styled.Text<{ isSelected: boolean }>`
  font-size: 14px;
  color: ${props => props.isSelected ? colors.white : colors.text.secondary};
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
`; 