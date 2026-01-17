import { useState, useCallback, useEffect, useRef } from 'react';
// useEffect is used for auto-play logic
import type { Position, Step, AnimationState } from '@/types';

interface UseAnimationReturn {
  animationState: AnimationState;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  goToStep: (stepIndex: number) => void;
}

const DEFAULT_SPEED = 1000; // 1 second per step

function createInitialState(): AnimationState {
  return {
    isPlaying: false,
    currentStepIndex: -1,
    speed: DEFAULT_SPEED,
    piratePosition: { row: 1, col: 1 },
    visitedCells: new Set<string>(['1,1']),
    completedSteps: [],
  };
}

export function useAnimation(steps: Step[]): UseAnimationReturn {
  const [animationState, setAnimationState] = useState<AnimationState>(() =>
    createInitialState()
  );
  const intervalRef = useRef<number | null>(null);

  // Calculate state for a given step index
  const calculateStateForStep = useCallback(
    (stepIndex: number): Partial<AnimationState> => {
      if (stepIndex < 0) {
        return {
          piratePosition: { row: 1, col: 1 },
          visitedCells: new Set<string>(['1,1']),
          completedSteps: [],
        };
      }

      const visitedCells = new Set<string>(['1,1']);
      const completedSteps: number[] = [];
      let piratePosition: Position = { row: 1, col: 1 };

      for (let i = 0; i <= stepIndex && i < steps.length; i++) {
        const step = steps[i];
        visitedCells.add(`${step.to.row},${step.to.col}`);
        completedSteps.push(i);
        piratePosition = { ...step.to };
      }

      return {
        piratePosition,
        visitedCells,
        completedSteps,
      };
    },
    [steps]
  );

  // Auto-play logic
  useEffect(() => {
    if (animationState.isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setAnimationState((prev) => {
          const nextStepIndex = prev.currentStepIndex + 1;

          if (nextStepIndex >= steps.length) {
            // Animation finished
            if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return { ...prev, isPlaying: false };
          }

          const newState = calculateStateForStep(nextStepIndex);
          return {
            ...prev,
            currentStepIndex: nextStepIndex,
            ...newState,
          };
        });
      }, animationState.speed);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [animationState.isPlaying, animationState.speed, steps.length, calculateStateForStep]);

  // Note: Reset is handled by the parent component calling the reset() function
  // when steps change (e.g., after a new calculation)

  const play = useCallback(() => {
    setAnimationState((prev) => {
      // If at the end, restart from beginning
      if (prev.currentStepIndex >= steps.length - 1) {
        return {
          ...createInitialState(),
          speed: prev.speed,
          isPlaying: true,
        };
      }
      return { ...prev, isPlaying: true };
    });
  }, [steps.length]);

  const pause = useCallback(() => {
    setAnimationState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const stepForward = useCallback(() => {
    setAnimationState((prev) => {
      if (prev.currentStepIndex >= steps.length - 1) return prev;

      const nextStepIndex = prev.currentStepIndex + 1;
      const newState = calculateStateForStep(nextStepIndex);

      return {
        ...prev,
        isPlaying: false,
        currentStepIndex: nextStepIndex,
        ...newState,
      };
    });
  }, [steps.length, calculateStateForStep]);

  const stepBack = useCallback(() => {
    setAnimationState((prev) => {
      if (prev.currentStepIndex < 0) return prev;

      const nextStepIndex = prev.currentStepIndex - 1;
      const newState = calculateStateForStep(nextStepIndex);

      return {
        ...prev,
        isPlaying: false,
        currentStepIndex: nextStepIndex,
        ...newState,
      };
    });
  }, [calculateStateForStep]);

  const reset = useCallback(() => {
    setAnimationState((prev) => ({
      ...createInitialState(),
      speed: prev.speed,
    }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setAnimationState((prev) => ({ ...prev, speed }));
  }, []);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < -1 || stepIndex >= steps.length) return;

      const newState = calculateStateForStep(stepIndex);
      setAnimationState((prev) => ({
        ...prev,
        isPlaying: false,
        currentStepIndex: stepIndex,
        ...newState,
      }));
    },
    [steps.length, calculateStateForStep]
  );

  return {
    animationState,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setSpeed,
    goToStep,
  };
}
