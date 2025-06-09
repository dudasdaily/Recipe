import styled from 'styled-components/native';
import { colors } from '@/styles/theme';

export const Container = styled.View`
  background-color: ${colors.background};
  padding: 0 20px;
  margin-bottom: 16px;
`;

export const SegmentContainer = styled.View`
  background-color: ${colors.gray[100]};
  border-radius: 22px;
  height: 44px;
  flex-direction: row;
  overflow: hidden;
`;

export const SegmentButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.isSelected ? colors.primary.main : 'transparent'};
`;

export const SegmentText = styled.Text<{ isSelected: boolean }>`
  color: ${props => props.isSelected ? colors.white : colors.text.secondary};
  font-size: 14px;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
`; 