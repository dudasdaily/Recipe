import styled from 'styled-components/native';
import { colors } from '@/styles/theme';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Toggle = styled.TouchableOpacity<{ isEnabled: boolean }>`
  width: 51px;
  height: 31px;
  border-radius: 15.5px;
  background-color: ${({ isEnabled }) => isEnabled ? colors.primary.main : colors.gray[300]};
  padding: 2px;
  justify-content: center;
`;

export const Knob = styled.View<{ isEnabled: boolean }>`
  width: 27px;
  height: 27px;
  border-radius: 13.5px;
  background-color: ${colors.white};
  align-self: ${({ isEnabled }) => isEnabled ? 'flex-end' : 'flex-start'};
`; 