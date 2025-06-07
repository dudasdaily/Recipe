import styled from 'styled-components/native';
import { Platform } from 'react-native';

export const Container = styled.View`
  flex-direction: row;
  height: 50px;
  background-color: #FFFFFF;
  border-top-width: 1px;
  border-top-color: #E5E5E5;
  ${Platform.select({
    ios: `
      shadow-color: #000000;
      shadow-offset: 0px -2px;
      shadow-opacity: 0.1;
      shadow-radius: 4px;
    `,
    android: `
      elevation: 8;
    `,
  })}
`;

export const TabButton = styled.TouchableOpacity<{
  isActive: boolean;
  disabled?: boolean;
}>`
  flex: 1;
  justify-content: center;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

export const TabLabel = styled.Text<{
  isActive: boolean;
}>`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ isActive }) => (isActive ? '#4A90E2' : '#999999')};
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};
`; 