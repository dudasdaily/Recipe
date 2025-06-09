import React, { memo } from 'react';
import { ScrollView, TextInput, Switch } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { CategoryFilter } from '@/components/ingredients/CategoryFilter';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import type { SingleAddFormProps, SingleAddFormData } from './types';
import {
  Container,
  Title,
  Section,
  Label,
  SaveButton,
  SaveButtonText,
} from './styles';

const DEFAULT_VALUES: SingleAddFormData = {
  name: '',
  quantity: '',
  unit: '',
  category: '채소',
  storageType: 'ROOM_TEMP',
  expiryDate: '',
  notificationEnabled: true,
};

export const SingleAddForm = memo(({ onSubmit }: SingleAddFormProps) => {
  const { control, handleSubmit } = useForm<SingleAddFormData>({
    defaultValues: DEFAULT_VALUES,
  });

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <ScrollView>
      <Container>
        <Title>재료 추가</Title>

        <Section>
          <Label>카테고리</Label>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <CategoryFilter
                selectedCategory={value}
                onChange={onChange}
              />
            )}
          />
        </Section>

        <Section>
          <Label>보관 방법</Label>
          <Controller
            control={control}
            name="storageType"
            render={({ field: { value, onChange } }) => (
              <StorageTypeSelector
                value={value}
                onChange={onChange}
              />
            )}
          />
        </Section>

        <Section>
          <Label>재료명</Label>
          <Controller
            control={control}
            name="name"
            rules={{ required: '재료명을 입력해주세요' }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="재료명을 입력하세요"
                style={{
                  height: 44,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                }}
              />
            )}
          />
        </Section>

        <Section>
          <Label>수량</Label>
          <Controller
            control={control}
            name="quantity"
            rules={{ required: '수량을 입력해주세요' }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="수량을 입력하세요"
                keyboardType="numeric"
                style={{
                  height: 44,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                }}
              />
            )}
          />
        </Section>

        <Section>
          <Label>단위</Label>
          <Controller
            control={control}
            name="unit"
            rules={{ required: '단위를 입력해주세요' }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="단위를 입력하세요"
                style={{
                  height: 44,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                }}
              />
            )}
          />
        </Section>

        <Section>
          <Label>유통기한</Label>
          <Controller
            control={control}
            name="expiryDate"
            rules={{ required: '유통기한을 입력해주세요' }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="YYYY-MM-DD"
                style={{
                  height: 44,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                }}
              />
            )}
          />
        </Section>

        <Section>
          <Label>알림 설정</Label>
          <Controller
            control={control}
            name="notificationEnabled"
            render={({ field: { value, onChange } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
              />
            )}
          />
        </Section>

        <SaveButton onPress={onFormSubmit}>
          <SaveButtonText>저장</SaveButtonText>
        </SaveButton>
      </Container>
    </ScrollView>
  );
});

SingleAddForm.displayName = 'SingleAddForm'; 