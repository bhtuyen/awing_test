import { Box, Paper, Typography } from '@mui/material';
import { AnimationControls } from './AnimationControls';
import { StepList } from './StepList';
import type { Step } from '@/types';

interface ResultPanelProps {
  steps: Step[];
  totalFuel: number;
  treasureChestNumber: number; // Số loại rương (p)
  // Animation props
  isPlaying: boolean;
  currentStepIndex: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function ResultPanel({
  steps,
  totalFuel,
  treasureChestNumber,
  isPlaying,
  currentStepIndex,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange
}: ResultPanelProps) {
  if (steps.length === 0) {
    return (
      <Paper elevation={2} className='p-4! flex items-center justify-center'>
        <Box className='text-center text-gray-500'>
          <Typography variant='h6' className='mb-2!'>
            Chưa có kết quả
          </Typography>
          <Typography variant='body2'>Nhập dữ liệu và nhấn "Tính toán" để xem kết quả</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box className='space-y-4!'>
      <AnimationControls
        isPlaying={isPlaying}
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        speed={speed}
        onPlay={onPlay}
        onPause={onPause}
        onStepForward={onStepForward}
        onStepBack={onStepBack}
        onReset={onReset}
        onSpeedChange={onSpeedChange}
      />

      <StepList
        steps={steps}
        currentStepIndex={currentStepIndex}
        totalFuel={totalFuel}
        treasureChestNumber={treasureChestNumber}
      />
    </Box>
  );
}
