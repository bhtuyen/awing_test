// Vị trí trong ma trận (1-indexed theo đề bài)
export interface Position {
  row: number;
  col: number;
}

// Một bước di chuyển
export interface Step {
  from: Position;
  to: Position;
  chestNumber: number; // Số rương đang đi đến
  distance: number; // Khoảng cách Euclidean
}

// Ma trận đầu vào
export type Matrix = number[][];

// Trạng thái game
export interface GameState {
  matrix: Matrix;
  n: number; // Số hàng
  m: number; // Số cột
  p: number; // Số loại rương
  steps: Step[]; // Các bước đi
  totalFuel: number; // Tổng nhiên liệu
  chestPositions: Map<number, Position>; // Vị trí của từng loại rương
}

// Trạng thái animation
export interface AnimationState {
  isPlaying: boolean;
  currentStepIndex: number; // -1 = chưa bắt đầu, 0 = bước 1, ...
  speed: number; // milliseconds per step
  piratePosition: Position; // Vị trí hiện tại của hải tặc
  visitedCells: Set<string>; // Các ô đã ghé thăm (format: "row,col")
  completedSteps: number[]; // Các bước đã hoàn thành
}

// Input params
export interface InputParams {
  n: number;
  m: number;
  p: number;
}

// Input mode
export type InputMode = 'manual' | 'textarea' | 'random';

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Props cho các components
export interface MatrixDisplayProps {
  matrix: Matrix;
  piratePosition: Position;
  visitedCells: Set<string>;
  targetCell?: Position; // Ô đang di chuyển đến
  chestPositions: Map<number, Position>;
  currentChest: number; // Rương hiện tại đang hướng đến
  steps: Step[];
  currentStepIndex: number;
}

export interface AnimationControlsProps {
  isPlaying: boolean;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export interface StepListProps {
  steps: Step[];
  currentStepIndex: number;
  totalFuel: number;
  treasureChestNumber: number; // Số loại rương (p) để xác định kho báu
}

// Cell component props
export interface CellProps {
  row: number;
  col: number;
  value: number;
  isPirateHere: boolean;
  isVisited: boolean;
  isTarget: boolean;
  isTreasure: boolean;
  isStart: boolean;
  totalChests: number;
}

// ============================================
// API Types - Response từ Backend (camelCase)
// ============================================

// Position từ API (camelCase)
export interface PositionDto {
  row: number;
  col: number;
}

// Step từ API (camelCase)
export interface StepDto {
  from: PositionDto;
  to: PositionDto;
  chestNumber: number;
  distance: number;
}

// Response từ API list (không bao gồm map_data, optimal_path)
export interface PirateTreasureListItem {
  pirateTreasureId: string;
  pirateTreasureName: string;
  mapRows: number;
  mapColumns: number;
  treasureChestNumber: number;
  totalFuel: number;
  createdDate: string;
}

// Response từ API detail (đầy đủ thông tin)
export interface PirateTreasureDetail {
  pirateTreasureId: string;
  pirateTreasureName: string;
  mapRows: number;
  mapColumns: number;
  treasureChestNumber: number;
  mapData: number[][];
  optimalPath: StepDto[];
  totalFuel: number;
  createdDate: string;
}

// Request body cho save
export interface SaveMapRequest {
  pirate_treasure_name: string;
  map_rows: number;
  map_columns: number;
  treasure_chest_number: number;
  Matrix: number[][];
}

// Request body cho update
export interface UpdateMapRequest {
  pirate_treasure_name: string;
  map_rows: number;
  map_columns: number;
  treasure_chest_number: number;
  Matrix: number[][];
}

// Response khi xóa thành công
export interface DeleteResponse {
  message: string;
}

// Helper function để convert StepDto sang Step (cho FE sử dụng)
export function convertStepDtoToStep(stepDto: StepDto): Step {
  return {
    from: { row: stepDto.from.row, col: stepDto.from.col },
    to: { row: stepDto.to.row, col: stepDto.to.col },
    chestNumber: stepDto.chestNumber,
    distance: stepDto.distance
  };
}

// Helper function để convert PirateTreasureDetail sang GameState
export function convertDetailToGameState(detail: PirateTreasureDetail): GameState {
  const steps = detail.optimalPath.map(convertStepDtoToStep);

  // Tạo Map với vị trí các rương từ steps
  const chestPositions = new Map<number, Position>();
  for (const step of steps) {
    chestPositions.set(step.chestNumber, step.to);
  }

  return {
    matrix: detail.mapData,
    n: detail.mapRows,
    m: detail.mapColumns,
    p: detail.treasureChestNumber,
    steps,
    totalFuel: detail.totalFuel,
    chestPositions
  };
}
