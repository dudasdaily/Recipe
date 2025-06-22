import styled from 'styled-components/native';

type StyledProps = {
  compact?: boolean;
};

export const Container = styled.View<StyledProps>`
  background-color: white;
  border-radius: 8px;
  padding: ${({ compact }) => compact ? '8px' : '16px'};
  margin: ${({ compact }) => compact ? '4px' : '8px'};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 3;
`;

export const Title = styled.Text<StyledProps>`
  font-size: ${({ compact }) => compact ? '14px' : '18px'};
  font-weight: bold;
  margin-bottom: ${({ compact }) => compact ? '4px' : '8px'};
`;

export const InfoText = styled.Text<StyledProps>`
  font-size: ${({ compact }) => compact ? '12px' : '14px'};
  color: #666;
  margin-bottom: ${({ compact }) => compact ? '2px' : '4px'};
  
  &:last-child {
    margin-bottom: 0;
  }
`; 