import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIngredients,
  createIngredient,
  getIngredient,
  updateIngredient,
  deleteIngredient,
} from '@/services/api/ingredients';
import type { Ingredient } from '@/types/api';

// 재료 목록 조회
export const useIngredientsQuery = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
  });
};

// 재료 생성
export const useCreateIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

// 재료 상세 조회
export const useIngredientQuery = (id: number) => {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: () => getIngredient(id),
    enabled: !!id,
  });
};

// 재료 수정
export const useUpdateIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ingredient }: { id: number; ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'> }) =>
      updateIngredient(id, ingredient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

// 재료 삭제
export const useDeleteIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}; 