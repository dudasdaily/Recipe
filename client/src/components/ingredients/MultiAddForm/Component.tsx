import React, { memo, useCallback } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { CategoryFilter, type Category } from '@/components/ingredients/CategoryFilter';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import type { StorageType } from '@/components/ingredients/StorageTypeSelector/types';
import { ImageRecognition } from '@/components/camera/ImageRecognition';
import type { RecognitionResult } from '@/components/camera/ImageRecognition/types';
import type { MultiAddFormProps, MultiAddFormData } from './types';
import {
  Container,
  Title,
  Section,
  Label,
  ItemContainer,
  ItemHeader,
  ItemTitle,
  DeleteButton,
  SaveButton,
  SaveButtonText,
} from './styles';

const DEFAULT_ITEM = {
  name: '',
  quantity: '',
  unit: '',
  category: '채소' as Category,
  storageType: 'ROOM_TEMP' as StorageType,
};

export const MultiAddForm = memo(({ onSubmit }: MultiAddFormProps) => {
  const { control, handleSubmit } = useForm<MultiAddFormData>({
    defaultValues: {
      items: [DEFAULT_ITEM]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const handleRecognitionResult = useCallback((result: RecognitionResult) => {
    result.items.forEach((item) => {
      append({
        ...DEFAULT_ITEM,
        name: item.name,
        quantity: item.quantity || '',
        unit: item.unit || '',
      });
    });
  }, [append]);

  return (
    <ScrollView>
      <Container>
        <Title>여러 재료 추가</Title>

        <Section>
          <Label>이미지 인식</Label>
          <ImageRecognition
            mode="MULTI"
            onResult={handleRecognitionResult}
          />
        </Section>

        {fields.map((field, index) => (
          <ItemContainer key={field.id}>
            <ItemHeader>
              <ItemTitle>{`재료 ${index + 1}`}</ItemTitle>
              {fields.length > 1 && (
                <DeleteButton onPress={() => remove(index)}>
                  <ItemTitle>삭제</ItemTitle>
                </DeleteButton>
              )}
            </ItemHeader>

            <Section>
              <Label>카테고리</Label>
              <Controller
                control={control}
                name={`items.${index}.category`}
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
                name={`items.${index}.storageType`}
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
                name={`items.${index}.name`}
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
                name={`items.${index}.quantity`}
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
                name={`items.${index}.unit`}
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
          </ItemContainer>
        ))}

        <SaveButton onPress={() => append(DEFAULT_ITEM)}>
          <SaveButtonText>재료 추가</SaveButtonText>
        </SaveButton>

        <SaveButton onPress={handleSubmit(onSubmit)}>
          <SaveButtonText>저장</SaveButtonText>
        </SaveButton>
      </Container>
    </ScrollView>
  );
});

MultiAddForm.displayName = 'MultiAddForm'; 