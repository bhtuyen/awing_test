import { Box, Paper, Typography } from '@mui/material';
import { Cell } from '@/components/MatrixDisplay/Cell';
import { PathLine } from '@/components/MatrixDisplay/PathLine';
import type { MatrixDisplayProps } from '@/types';

export function MatrixDisplay({
  matrix,
  piratePosition,
  visitedCells,
  chestPositions,
  currentChest,
  steps,
  currentStepIndex,
}: Omit<MatrixDisplayProps, 'targetCell'>) {
  if (!matrix || matrix.length === 0) {
    return (
      <Paper elevation={2} className="p-4! flex items-center justify-center">
        <Typography color="textSecondary">
          Nhập dữ liệu và nhấn "Tính toán" để hiển thị ma trận
        </Typography>
      </Paper>
    );
  }

  const n = matrix.length;
  const m = matrix[0]?.length || 0;
  const p = Math.max(...matrix.flat());

  // Tính kích thước cell dựa trên số ô
  const maxCells = Math.max(n, m);
  const cellSize = Math.max(32, Math.min(50, 400 / maxCells));
  const gridGap = 4;

  // Tìm vị trí target (rương tiếp theo cần đến)
  const targetPosition = currentChest > 0 && currentChest <= p 
    ? chestPositions.get(currentChest) 
    : undefined;

  return (
    <Paper elevation={2} className="p-4!">
      <Typography variant="h6" className="mb-4! font-bold text-gray-800">
        Ma trận hòn đảo
      </Typography>

      {/* Legend */}
      <Box className="flex flex-wrap gap-4! mb-4! text-sm">
        <span className="flex items-center gap-1!">
          <span className="relative w-4 h-4 rounded bg-white border-2 border-blue-500">
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </span>
          Điểm bắt đầu
        </span>
        <span className="flex items-center gap-1!">
          <span className="w-4! h-4! rounded bg-amber-400" />
          Kho báu
        </span>
        <span className="flex items-center gap-1!">
          <span className="w-4! h-4! rounded bg-green-100 border-2 border-green-500" />
          Đã đi qua
        </span>
        <span className="flex items-center gap-1!">
          <span className="w-4! h-4! rounded bg-white border-3 border-red-500" />
          Đích đến
        </span>
        <span className="flex items-center gap-1!">
          <span className="w-4! h-4! rounded bg-white border border-gray-300" />
          Chưa đi qua
        </span>
        <span className="flex items-center gap-1!">
          🏴‍☠️ Hải tặc
        </span>
      </Box>

      {/* Matrix Grid */}
      <Box className="overflow-auto max-h-96">
        <Box
          className="relative inline-block"
          sx={{ padding: '8px' }}
        >
          {/* Path overlay */}
          <PathLine
            steps={steps}
            currentStepIndex={currentStepIndex}
            cellSize={cellSize}
            gridGap={gridGap}
          />

          {/* Grid */}
          <Box
            className="grid relative z-10"
            sx={{
              gridTemplateColumns: `repeat(${m}, ${cellSize}px)`,
              gap: `${gridGap}px`,
            }}
          >
            {matrix.map((row, rowIndex) =>
              row.map((cellValue, colIndex) => {
                const cellRow = rowIndex + 1;
                const cellCol = colIndex + 1;
                const cellKey = `${cellRow},${cellCol}`;

                const isPirateHere =
                  piratePosition.row === cellRow &&
                  piratePosition.col === cellCol;
                const isVisited = visitedCells.has(cellKey);
                const isTarget =
                  targetPosition?.row === cellRow &&
                  targetPosition?.col === cellCol;
                const isTreasure = cellValue === p;
                const isStart = cellRow === 1 && cellCol === 1;

                return (
                  <Cell
                    key={cellKey}
                    value={cellValue}
                    isPirateHere={isPirateHere}
                    isVisited={isVisited}
                    isTarget={isTarget}
                    isTreasure={isTreasure}
                    isStart={isStart}
                    totalChests={p}
                  />
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Info */}
      <Box className="mt-4! flex flex-wrap gap-4! text-sm text-gray-600">
        <span>Kích thước: {n} × {m}</span>
        <span>Số loại rương: {p}</span>
        <span>
          Vị trí hải tặc: ({piratePosition.row}, {piratePosition.col})
        </span>
        {currentChest > 0 && currentChest <= p && (
          <span className="text-red-600 font-medium">
            Đích đến: Rương {currentChest}
          </span>
        )}
      </Box>
    </Paper>
  );
}
