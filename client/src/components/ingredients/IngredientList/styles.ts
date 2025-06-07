import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
`;

export const FilterContainer = styled.View`
  padding: 16px;
  background-color: #FFFFFF;
  border-bottom-width: 1px;
  border-bottom-color: #E5E5E5;
`;

export const ListContainer = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;

export const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

export const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #999999;
  text-align: center;
  margin-top: 8px;
`; 