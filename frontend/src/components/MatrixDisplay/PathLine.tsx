import { Box } from '@mui/material';
import type { Step, Position } from '@/types';

interface PathLineProps {
  steps: Step[];
  currentStepIndex: number;
  cellSize: number;
  gridGap: number;
}

export function PathLine({
  steps,
  currentStepIndex,
  cellSize,
  gridGap,
}: PathLineProps) {
  if (currentStepIndex < 0 || steps.length === 0) {
    return null;
  }

  // Convert grid position to pixel position (center of cell)
  const getPixelPosition = (pos: Position) => ({
    x: (pos.col - 1) * (cellSize + gridGap) + cellSize / 2,
    y: (pos.row - 1) * (cellSize + gridGap) + cellSize / 2,
  });

  // Build path string
  const pathPoints: string[] = [];
  
  // Start from (1,1)
  const startPos = getPixelPosition({ row: 1, col: 1 });
  pathPoints.push(`M ${startPos.x} ${startPos.y}`);

  // Add lines for each completed step
  for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
    const step = steps[i];
    const toPos = getPixelPosition(step.to);
    pathPoints.push(`L ${toPos.x} ${toPos.y}`);
  }

  const pathD = pathPoints.join(' ');

  return (
    <Box
      component="svg"
      className="absolute inset-0 pointer-events-none z-20"
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        zIndex: 20,
      }}
    >
      {/* Path shadow */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Main path */}
      <path
        d={pathD}
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6,3"
        className="animate-pulse"
      />

      {/* Step markers */}
      {steps.slice(0, currentStepIndex + 1).map((step, index) => {
        const pos = getPixelPosition(step.to);
        return (
          <g key={index}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="6"
              fill="#ef4444"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={pos.x}
              y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="white"
              fontWeight="bold"
            >
              {index + 1}
            </text>
          </g>
        );
      })}
    </Box>
  );
}
