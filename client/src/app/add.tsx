import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { SingleAddForm } from '@/components/ingredients/SingleAddForm';
import type { SingleAddFormData } from '@/components/ingredients/SingleAddForm/types';

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const Content = styled.View`
  flex: 1;
  padding: 16px;
`;

export const AddScreen = memo(() => {
  const handleSubmit = async (data: SingleAddFormData) => {
    try {
      console.log('Form submitted:', data);
      // TODO: 데이터 처리 로직 구현
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Container>
      <ScrollView>
        <Content>
          <SingleAddForm onSubmit={handleSubmit} />
        </Content>
      </ScrollView>
    </Container>
  );
});

AddScreen.displayName = 'AddScreen'; 