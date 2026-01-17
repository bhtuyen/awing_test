import { useState, useCallback } from 'react';
import type { Matrix, GameState, InputParams, ValidationResult } from '@/types';
import { createGameState } from '@/utils/algorithm';
import { validateParams, validateMatrix } from '@/utils/validation'  

interface UseTreasureHuntReturn {
  gameState: GameState | null;
  isCalculating: boolean;
  error: string | null;
  calculate: (matrix: Matrix, params: InputParams) => ValidationResult;
  reset: () => void;
}

export function useTreasureHunt(): UseTreasureHuntReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(
    (matrix: Matrix, params: InputParams): ValidationResult => {
      setError(null);
      setIsCalculating(true);

      try {
        // Validate params
        const paramsValidation = validateParams(params);
        if (!paramsValidation.isValid) {
          setError(paramsValidation.errors.join('\n'));
          setIsCalculating(false);
          return paramsValidation;
        }

        // Validate matrix
        const matrixValidation = validateMatrix(
          matrix,
          params.n,
          params.m,
          params.p
        );
        if (!matrixValidation.isValid) {
          setError(matrixValidation.errors.join('\n'));
          setIsCalculating(false);
          return matrixValidation;
        }

        // Calculate game state
        const state = createGameState(matrix, params.n, params.m, params.p);
        setGameState(state);
        setIsCalculating(false);

        return { isValid: true, errors: [] };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Lỗi không xác định';
        setError(errorMessage);
        setIsCalculating(false);
        return { isValid: false, errors: [errorMessage] };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setGameState(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  return {
    gameState,
    isCalculating,
    error,
    calculate,
    reset,
  };
}
