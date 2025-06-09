import React, { useCallback } from 'react';
import { FlatList, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import styled from 'styled-components/native';
import { colors } from '@/styles/theme';
import { IngredientCard } from '@/components/ingredients/IngredientCard';
import { useIngredientStore } from '@/stores/ingredient';
import type { Ingredient, StorageType } from '@/types/ingredient';

const Container = styled.View`
  flex: 1;
  background-color: ${colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: 16px;
`;

const SearchContainer = styled.View`
  margin-bottom: 16px;
`;

const SearchInput = styled.TextInput`
  background-color: ${colors.white};
  padding: 12px 16px;
  border-radius: 22px;
  border: 1px solid ${colors.border};
  font-size: 14px;
`;

const FilterContainer = styled.View`
  margin-bottom: 16px;
`;

const FilterScrollView = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingRight: 16,
  },
})``;

const FilterButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  padding: 8px 16px;
  border-radius: 16px;
  background-color: ${props => props.isSelected ? colors.primary.main : colors.white};
  margin-right: 8px;
  border: 1px solid ${props => props.isSelected ? colors.primary.main : colors.border};
`;

const FilterText = styled.Text<{ isSelected: boolean }>`
  color: ${props => props.isSelected ? colors.white : colors.text.primary};
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
  font-size: 12px;
`;

const EmptyView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 32px;
`;

const EmptyText = styled.Text`
  color: ${colors.text.secondary};
  font-size: 16px;
  text-align: center;
  line-height: 24px;
`;

const STORAGE_TYPES: { value: StorageType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ROOM_TEMP', label: '실온' },
  { value: 'REFRIGERATED', label: '냉장' },
  { value: 'FROZEN', label: '냉동' },
];

export default function Home() {
  const { 
    ingredients,
    selectedStorageType,
    selectedCategory,
    setSelectedStorageType,
    setSelectedCategory
  } = useIngredientStore();

  const filteredIngredients = ingredients.filter(ingredient => {
    if (selectedStorageType !== 'ALL' && ingredient.storageType !== selectedStorageType) {
      return false;
    }
    if (selectedCategory !== 'ALL' && ingredient.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const renderItem = useCallback(({ item }: { item: Ingredient }) => (
    <IngredientCard 
      ingredient={item}
      onPress={() => {
        // TODO: 상세 화면으로 이동
      }}
    />
  ), []);

  const renderEmpty = useCallback(() => (
    <EmptyView>
      <EmptyText>등록된 식재료가 없습니다.{'\n'}우측 하단의 + 버튼을 눌러{'\n'}식재료를 추가해보세요.</EmptyText>
    </EmptyView>
  ), []);

  return (
    <Container>
      <Stack.Screen
        options={{
          title: '나의 식재료',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.primary.main,
          },
          headerTitleStyle: {
            color: colors.white,
            fontSize: 20,
            fontWeight: 'bold',
          },
        }}
      />
      <ContentContainer>
        <SearchContainer>
          <SearchInput
            placeholder="재료 검색..."
            placeholderTextColor={colors.text.secondary}
          />
        </SearchContainer>

        <FilterContainer>
          <FilterScrollView>
            {STORAGE_TYPES.map((type) => (
              <FilterButton 
                key={type.value}
                isSelected={selectedStorageType === type.value}
                onPress={() => setSelectedStorageType(type.value)}
              >
                <FilterText isSelected={selectedStorageType === type.value}>
                  {type.label}
                </FilterText>
              </FilterButton>
            ))}
          </FilterScrollView>
        </FilterContainer>

        <FlatList
          data={filteredIngredients}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: 16,
          }}
        />
      </ContentContainer>
    </Container>
  );
} 