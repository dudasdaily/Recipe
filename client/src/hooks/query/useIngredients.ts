import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '@/services/api/ingredients';
import {
  analyzeReceiptImage,
  getReceipt,
  getReceiptList
} from '@/services/api/ocr';
import type { Ingredient } from '@/types/api';

// 기존 재료 관련 훅들
export const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
  });
};

export const useCreateIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useUpdateIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ingredient }: { id: number; ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'> }) =>
      updateIngredient(id, ingredient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

export const useDeleteIngredient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};

// 영수증 관련 새로운 훅들
export const useAnalyzeReceipt = () => {
  return useMutation({
    mutationFn: analyzeReceiptImage,
    onError: (error) => {
      console.error('영수증 분석 실패:', error);
    },
  });
};

export const useReceipt = (receiptId: number) => {
  return useQuery({
    queryKey: ['receipt', receiptId],
    queryFn: () => getReceipt(receiptId),
    enabled: !!receiptId,
  });
};

export const useReceiptList = () => {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: getReceiptList,
  });
};

// 영수증에서 재료 생성 (다중 재료 추가)
export const useCreateIngredientsFromReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ingredients: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>[]) => {
      const results = await Promise.all(
        ingredients.map(ingredient => createIngredient(ingredient))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (error) => {
      console.error('영수증 재료 추가 실패:', error);
    },
  });
}; 