import { Box, Typography } from '@mui/material';
import type { CellProps } from '@/types';
import { PirateIcon } from './PirateIcon';

// Tạo màu gradient dựa trên số rương
function getCellColor(value: number, totalChests: number, isTreasure: boolean): string {
  if (isTreasure) {
    return '#fbbf24'; // Amber-400 for treasure
  }
  
  // Gradient từ xanh nhạt đến xanh đậm
  const hue = 200 + (value / totalChests) * 60; // 200-260 (blue range)
  const saturation = 60 + (value / totalChests) * 20;
  const lightness = 85 - (value / totalChests) * 25;
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function Cell({
  value,
  isPirateHere,
  isVisited,
  isTarget,
  isTreasure,
  isStart,
  totalChests,
}: Omit<CellProps, 'row' | 'col'>) {
  const backgroundColor = getCellColor(value, totalChests, isTreasure);
  
  return (
    <Box
      className="relative flex items-center justify-center transition-all duration-300"
      sx={{
        backgroundColor,
        border: isTarget
          ? '3px solid #ef4444'
          : isVisited
            ? '2px solid #22c55e'
            : isStart
              ? '2px solid #3b82f6'
              : '1px solid #e5e7eb',
        borderRadius: '4px',
        aspectRatio: '1',
        minWidth: '32px',
        minHeight: '32px',
        boxShadow: isPirateHere
          ? '0 0 12px rgba(239, 68, 68, 0.5)'
          : isTarget
            ? '0 0 8px rgba(239, 68, 68, 0.3)'
            : 'none',
        transform: isPirateHere ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Số rương */}
      <Typography
        variant="caption"
        className="font-bold select-none"
        sx={{
          fontSize: 'clamp(10px, 1.5vw, 14px)',
          color: isTreasure ? '#78350f' : '#374151',
          opacity: isPirateHere ? 0.5 : 1,
        }}
      >
        {value}
      </Typography>

      {/* Icon hải tặc */}
      {isPirateHere && (
        <Box className="absolute inset-0 flex items-center justify-center">
          <PirateIcon size={20} animated />
        </Box>
      )}

      {/* Badge cho ô bắt đầu */}
      {isStart && !isPirateHere && (
        <Box
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
          title="Điểm bắt đầu"
        />
      )}

      {/* Icon kho báu */}
      {isTreasure && (
        <Box className="absolute -top-1 -left-1 text-xs">💎</Box>
      )}

      {/* Checkmark cho ô đã ghé thăm */}
      {isVisited && !isPirateHere && (
        <Box className="absolute -bottom-1 -right-1 text-xs text-green-600">✓</Box>
      )}
    </Box>
  );
}
