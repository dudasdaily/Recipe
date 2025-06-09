import styled from 'styled-components/native';
import { colors } from './theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${colors.background};
`;

export const Content = styled.View`
  flex: 1;
  padding: 16px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Column = styled.View`
  flex-direction: column;
`;

export const Spacer = styled.View<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`; 