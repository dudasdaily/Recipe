import styled from 'styled-components/native';
import { colors } from '@/styles/theme';

export const Container = styled.TouchableOpacity`
  background-color: ${colors.white};
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 8px;
  border: 1px solid ${colors.border};
  shadow-color: ${colors.shadow};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colors.text.primary};
`;

export const ExpiryBadge = styled.View<{ isNear: boolean }>`
  background-color: ${props => props.isNear ? colors.warning : colors.text.secondary};
  padding: 4px 8px;
  border-radius: 4px;
`;

export const ExpiryText = styled.Text`
  font-size: 12px;
  color: ${colors.white};
`;

export const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const InfoText = styled.Text`
  font-size: 14px;
  color: ${colors.text.secondary};
`;

export const StorageType = styled.View<{ type: 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN' }>`
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.type) {
      case 'ROOM_TEMP':
        return colors.storage.roomTemp;
      case 'REFRIGERATED':
        return colors.storage.refrigerated;
      case 'FROZEN':
        return colors.storage.frozen;
    }
  }};
`;

export const StorageText = styled.Text`
  font-size: 12px;
  color: ${colors.white};
`;

export const NotificationButton = styled.TouchableOpacity`
  padding: 4px;
`;

export const ButtonGroup = styled.View`
  flex-direction: row;
  gap: 8px;
`;

export const IconButton = styled.TouchableOpacity`
  padding: 4px;
`;

export const InfoContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const InfoGroup = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`; 