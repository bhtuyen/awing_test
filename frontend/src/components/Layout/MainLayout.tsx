import { Box, Container, Typography, AppBar, Toolbar, Paper } from '@mui/material';
import { useEffect, useRef, useCallback } from 'react';
import ExploreIcon from '@mui/icons-material/Explore';
import { InputPanel } from '@/components/InputPanel/InputPanel';
import { MatrixDisplay } from '@/components/MatrixDisplay/MatrixDisplay';
import { ResultPanel } from '@/components/ResultPanel/ResultPanel';
import { useTreasureHunt } from '@/hooks/useTreasureHunt';
import { useAnimation } from '@/hooks/useAnimation';
import type { Matrix, InputParams, GameState } from '@/types';

export function MainLayout() {
  const { gameState, isCalculating, error, calculate, reset, loadGameState } = useTreasureHunt();

  const steps = gameState?.steps || [];
  const {
    animationState,
    play,
    pause,
    stepForward,
    stepBack,
    reset: resetAnimation,
    setSpeed,
    goToStep
  } = useAnimation(steps);

  // Track previous steps length để chỉ auto-display khi có steps mới
  const prevStepsLengthRef = useRef<number>(0);

  // Tự động hiển thị toàn bộ đường đi khi có steps mới (sau khi tính toán xong)
  useEffect(() => {
    // Chỉ chạy khi steps.length thay đổi (có tính toán mới)
    if (steps.length > 0 && steps.length !== prevStepsLengthRef.current) {
      prevStepsLengthRef.current = steps.length;
      // Hiển thị toàn bộ đường đi ngay sau khi tính toán xong
      goToStep(steps.length - 1);
    }
  }, [steps.length, goToStep]);

  const handleCalculate = (matrix: Matrix, params: InputParams) => {
    // Reset animation trước khi tính toán mới để xóa visitedCells cũ
    resetAnimation();
    prevStepsLengthRef.current = 0;
    calculate(matrix, params);
  };

  const handleReset = () => {
    reset();
    resetAnimation();
    prevStepsLengthRef.current = 0;
  };

  /**
   * Xử lý khi load bản đồ từ history
   */
  const handleLoadFromHistory = useCallback(
    (loadedGameState: GameState) => {
      // Reset animation trước
      resetAnimation();
      prevStepsLengthRef.current = 0;
      // Load game state mới
      loadGameState(loadedGameState);
    },
    [loadGameState, resetAnimation]
  );

  // Determine current chest target based on current step
  const currentChest =
    animationState.currentStepIndex >= 0 && steps.length > 0
      ? steps[animationState.currentStepIndex]?.chestNumber || 0
      : 0;

  // Get current matrix and params for InputPanel
  const currentMatrix = gameState?.matrix || null;
  const currentParams = gameState ? { n: gameState.n, m: gameState.m, p: gameState.p } : null;

  return (
    <Box className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100'>
      {/* Header */}
      <AppBar position='sticky' className='bg-linear-to-r from-blue-600 to-indigo-700'>
        <Toolbar>
          <ExploreIcon className='mr-3!' />
          <Typography variant='h6' className='font-bold'>
            Treasure Hunt - Tìm Kho Báu
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth='xl' className='pb-6!'>
        {/* Description */}
        <Paper elevation={1} className='p-4! my-3! bg-white/80! backdrop-blur!'>
          <Typography variant='body2' className='text-gray-700'>
            <strong>Bài toán:</strong> Đoàn hải tặc cần tìm đường đi ngắn nhất để lấy kho báu. Vùng biển là ma trận n×m
            hòn đảo, mỗi đảo có một rương đánh số từ 1 đến p. Rương x chứa chìa khóa cho rương x+1.{' '}
            <strong>Kho báu nằm trong rương số p</strong> (rương p chỉ xuất hiện đúng 1 lần). Để có đường đi đến kho
            báu, trên bản đồ cần phải có các rương từ 1 đến p-1 (mỗi loại ít nhất 1 lần). Hải tặc bắt đầu từ vị trí
            (1,1) với chìa khóa để mở rương loại 1. Khoảng cách giữa hai đảo được tính bằng công thức Euclidean.
          </Typography>
        </Paper>

        {/* Two-column layout */}
        <Box className='grid grid-cols-1 lg:grid-cols-12 gap-6!'>
          {/* Left column - Input */}
          <Box className='lg:col-span-4'>
            <InputPanel
              onCalculate={handleCalculate}
              onReset={handleReset}
              onLoadFromHistory={handleLoadFromHistory}
              isCalculating={isCalculating}
              error={error}
              currentMatrix={currentMatrix}
              currentParams={currentParams}
            />
          </Box>

          {/* Right column - Output */}
          <Box className='lg:col-span-8 space-y-6!'>
            {/* Matrix Display */}
            <MatrixDisplay
              matrix={gameState?.matrix || []}
              piratePosition={animationState.piratePosition}
              visitedCells={animationState.visitedCells}
              chestPositions={gameState?.chestPositions || new Map()}
              currentChest={currentChest}
              steps={steps}
              currentStepIndex={animationState.currentStepIndex}
            />

            {/* Result Panel */}
            <ResultPanel
              steps={steps}
              totalFuel={gameState?.totalFuel || 0}
              treasureChestNumber={gameState?.p || 0}
              isPlaying={animationState.isPlaying}
              currentStepIndex={animationState.currentStepIndex}
              speed={animationState.speed}
              onPlay={play}
              onPause={pause}
              onStepForward={stepForward}
              onStepBack={stepBack}
              onReset={resetAnimation}
              onSpeedChange={setSpeed}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
