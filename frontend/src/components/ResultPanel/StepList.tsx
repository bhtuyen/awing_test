import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import type { StepListProps } from '@/types';
import { formatFuel } from '@/utils/algorithm';
import { MathDisplay } from '@/components/MathDisplay/MathDisplay';

export function StepList({ steps, currentStepIndex, totalFuel }: StepListProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <Paper elevation={1} className="p-4!">
      {/* Total fuel display */}
      <Box className="mb-4! p-4! bg-linear-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
        <Typography variant="overline" className="opacity-80">
          Tổng nhiên liệu cần thiết
        </Typography>
        <Typography variant="h4" className="font-bold">
          <MathDisplay value={formatFuel(totalFuel)} />
        </Typography>
        <Typography variant="caption" className="opacity-80">
          đơn vị khoảng cách
        </Typography>
      </Box>

      {/* Steps list */}
      <Typography variant="subtitle2" className="mb-2! font-semibold text-gray-700">
        Chi tiết các bước ({steps.length} bước)
      </Typography>

      <List dense className="max-h-64 overflow-auto">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <ListItem
              key={index}
              className={`rounded-lg mb-1! transition-colors ${
                isCurrent
                  ? 'bg-blue-50 border border-blue-200'
                  : isCompleted
                    ? 'bg-green-50'
                    : 'bg-gray-50'
              }`}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isCurrent ? (
                  <PlayCircleIcon color="primary" />
                ) : isCompleted ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <RadioButtonUncheckedIcon color="disabled" />
                )}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box className="flex items-center gap-2!">
                    <span className="font-medium">Bước {index + 1}</span>
                    <Chip
                      label={`Rương ${step.chestNumber}`}
                      size="small"
                      color={step.chestNumber === steps.length ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box className="text-xs mt-1!">
                    <span className="text-gray-600">
                      ({step.from.row}, {step.from.col}) → ({step.to.row},{' '}
                      {step.to.col})
                    </span>
                    <span className="mx-2!">|</span>
                    <span className="text-blue-600 font-medium">
                      <MathDisplay value={formatFuel(step.distance, 4)} /> đơn vị
                    </span>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>

      {/* Summary */}
      <Box className="mt-4! pt-4! border-t border-gray-200">
        <Box className="flex justify-between text-sm">
          <span className="text-gray-600">Bước đã hoàn thành:</span>
          <span className="font-medium">
            {Math.max(0, currentStepIndex + 1)} / {steps.length}
          </span>
        </Box>
        <Box className="flex justify-between text-sm mt-1!">
          <span className="text-gray-600">Nhiên liệu đã dùng:</span>
          <span className="font-medium text-green-600">
            <MathDisplay
              value={formatFuel(
                steps
                  .slice(0, currentStepIndex + 1)
                  .reduce((sum, s) => sum + s.distance, 0)
              )}
            />
          </span>
        </Box>
      </Box>
    </Paper>
  );
}
