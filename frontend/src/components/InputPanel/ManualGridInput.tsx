import { TextField, Box, Typography, Paper } from '@mui/material';
import type { Matrix } from '@/types';

interface ManualGridInputProps {
  matrix: Matrix;
  onChange: (matrix: Matrix) => void;
  n: number;
  m: number;
  p: number;
  disabled?: boolean;
}

export function ManualGridInput({
  matrix,
  onChange,
  n,
  m,
  p,
  disabled = false,
}: ManualGridInputProps) {
  const handleCellChange = (row: number, col: number, value: string) => {
    const numValue = parseInt(value, 10) || 1;
    const clampedValue = Math.max(1, Math.min(p, numValue));

    const newMatrix = matrix.map((r, i) =>
      i === row ? r.map((c, j) => (j === col ? clampedValue : c)) : r
    );

    onChange(newMatrix);
  };

  // Tính toán kích thước ô dựa trên số cột
  const cellSize = Math.max(40, Math.min(60, 400 / Math.max(m, 1)));

  if (n === 0 || m === 0) {
    return (
      <Box className="p-4! text-center text-gray-500">
        <Typography>Vui lòng nhập n và m trước</Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-2!">
      <Typography variant="subtitle2" className="text-gray-600">
        Nhập giá trị cho từng ô (1 đến {p})
      </Typography>

      <Paper
        elevation={0}
        className="overflow-auto max-h-80 p-2! bg-gray-50 border border-gray-200 rounded-lg"
      >
        <Box
          className="inline-grid gap-1!"
          sx={{
            gridTemplateColumns: `repeat(${m}, ${cellSize}px)`,
          }}
        >
          {matrix.map((row, rowIndex) =>
            row.map((cellValue, colIndex) => (
              <TextField
                key={`${rowIndex}-${colIndex}`}
                type="number"
                value={cellValue}
                onChange={(e) =>
                  handleCellChange(rowIndex, colIndex, e.target.value)
                }
                disabled={disabled}
                size="small"
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: p,
                    style: {
                      textAlign: 'center',
                      padding: '4px',
                      fontSize: cellSize > 45 ? '14px' : '12px',
                    },
                  },
                }}
                sx={{
                  width: cellSize,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor:
                      cellValue === p
                        ? '#fef3c7'
                        : rowIndex === 0 && colIndex === 0
                          ? '#dbeafe'
                          : 'white',
                  },
                }}
              />
            ))
          )}
        </Box>
      </Paper>

      <Box className="flex gap-4! text-xs text-gray-500">
        <span className="flex items-center gap-1!">
          <span className="w-3! h-3! bg-blue-100 border border-blue-300 rounded" />
          Vị trí bắt đầu (1,1)
        </span>
        <span className="flex items-center gap-1!">
          <span className="w-3! h-3! bg-amber-100 border border-amber-300 rounded" />
          Kho báu (rương {p})
        </span>
      </Box>
    </Box>
  );
}
