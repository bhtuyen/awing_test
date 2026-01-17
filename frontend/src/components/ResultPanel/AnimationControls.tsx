import {
  Box,
  IconButton,
  Slider,
  Typography,
  LinearProgress,
  Tooltip,
  Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import type { AnimationControlsProps } from '@/types';

export function AnimationControls({
  isPlaying,
  currentStepIndex,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
}: AnimationControlsProps) {
  const progress =
    totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  const isAtStart = currentStepIndex < 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;

  // Speed marks for slider
  const speedMarks = [
    { value: 2000, label: 'Chậm' },
    { value: 1000, label: 'Bình thường' },
    { value: 500, label: 'Nhanh' },
    { value: 200, label: 'Rất nhanh' },
  ];

  return (
    <Paper elevation={1} className="p-4! bg-gray-50">
      <Typography variant="subtitle2" className="mb-3! font-semibold text-gray-700">
        Điều khiển Animation
      </Typography>

      {/* Progress bar */}
      <Box className="mb-4!">
        <Box className="flex justify-between text-sm text-gray-600 mb-1!">
          <span>Tiến trình</span>
          <span>
            Bước {Math.max(0, currentStepIndex + 1)} / {totalSteps}
          </span>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          className="h-2 rounded"
          sx={{
            backgroundColor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#3b82f6',
            },
          }}
        />
      </Box>

      {/* Control buttons */}
      <Box className="flex items-center justify-center gap-2! mb-4!">
        <Tooltip title="Về đầu">
          <IconButton
            onClick={onReset}
            disabled={isAtStart}
            size="small"
            className="bg-gray-200 hover:bg-gray-300"
          >
            <RestartAltIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Bước trước">
          <IconButton
            onClick={onStepBack}
            disabled={isAtStart}
            size="small"
            className="bg-gray-200 hover:bg-gray-300"
          >
            <SkipPreviousIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={isPlaying ? 'Tạm dừng' : 'Chạy'}>
          <IconButton
            onClick={isPlaying ? onPause : onPlay}
            disabled={isAtEnd && !isPlaying}
            size="large"
            className="bg-blue-500 text-white hover:bg-blue-600"
            sx={{
              '&.Mui-disabled': {
                backgroundColor: '#9ca3af',
                color: 'white',
              },
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Bước tiếp">
          <IconButton
            onClick={onStepForward}
            disabled={isAtEnd}
            size="small"
            className="bg-gray-200 hover:bg-gray-300"
          >
            <SkipNextIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Speed slider */}
      <Box className="px-2!">
        <Box className="flex items-center gap-2! mb-1!">
          <SpeedIcon fontSize="small" className="text-gray-500" />
          <Typography variant="caption" className="text-gray-600">
            Tốc độ: {speed}ms/bước
          </Typography>
        </Box>
        <Slider
          value={speed}
          onChange={(_, value) => onSpeedChange(value as number)}
          min={100}
          max={2000}
          step={100}
          marks={speedMarks}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}ms`}
          sx={{
            '& .MuiSlider-markLabel': {
              fontSize: '10px',
            },
          }}
          // Invert direction so left = slow, right = fast
          track="inverted"
        />
      </Box>
    </Paper>
  );
}
