import type { Matrix, Position, Step, GameState } from '@/types';

/**
 * Tính khoảng cách Euclidean giữa 2 điểm
 */
export function euclideanDistance(p1: Position, p2: Position): number {
  return Math.sqrt(Math.pow(p1.row - p2.row, 2) + Math.pow(p1.col - p2.col, 2));
}

/**
 * Tìm vị trí của tất cả các loại rương trong ma trận
 * Trả về Map với key là loại rương, value là mảng các vị trí có loại rương đó
 */
export function findChestPositions(
  matrix: Matrix,
  p: number
): Map<number, Position[]> {
  const positions = new Map<number, Position[]>();

  // Khởi tạo mảng cho mỗi loại rương
  for (let chest = 1; chest <= p; chest++) {
    positions.set(chest, []);
  }

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const chestNumber = matrix[row][col];
      if (chestNumber >= 1 && chestNumber <= p) {
        // Lưu vị trí (1-indexed theo đề bài)
        const pos = { row: row + 1, col: col + 1 };
        const existing = positions.get(chestNumber) || [];
        existing.push(pos);
        positions.set(chestNumber, existing);
      }
    }
  }

  return positions;
}

/**
 * Tính toán đường đi tối ưu sử dụng Dynamic Programming
 * Bài toán: Tìm đường đi ngắn nhất từ (1,1) qua các loại rương 1, 2, ..., p
 * Mỗi loại chỉ cần đi đến 1 ô (vì 1 rương đã cho chìa khóa để mở loại tiếp theo)
 * 
 * Thuật toán: DP qua các lớp
 * dp[k][i] = khoảng cách ngắn nhất để đến ô thứ i của loại k
 */
export function calculatePath(matrix: Matrix, p: number): Step[] {
  const chestPositions = findChestPositions(matrix, p);
  
  // Kiểm tra tất cả các loại rương đều tồn tại
  for (let chest = 1; chest <= p; chest++) {
    const positions = chestPositions.get(chest);
    if (!positions || positions.length === 0) {
      throw new Error(`Không tìm thấy rương số ${chest} trong ma trận`);
    }
  }

  // Vị trí bắt đầu
  const startPos: Position = { row: 1, col: 1 };
  
  // Giá trị ô (1,1) - hải tặc bắt đầu ở đây
  const startValue = matrix[0][0];
  
  // Hải tặc bắt đầu với chìa khóa để mở rương loại 1
  // Phải mở theo thứ tự: 1 -> 2 -> ... -> p
  // Nếu ô (1,1) có giá trị 1, hải tặc đã ở rương 1, có thể mở ngay
  // => bắt đầu từ loại 2
  let startChest = 1;
  
  if (startValue === 1) {
    // Hải tặc đang ở rương loại 1, đã mở xong
    // => bắt đầu từ loại 2
    startChest = 2;
  }

  if (startChest > p) {
    // Không cần đi đâu, đã có kho báu
    return [];
  }

  // DP: dp[chest][posIndex] = { minDistance, prevChest, prevPosIndex }
  const dp: Map<number, { dist: number; prevChest: number; prevPosIndex: number }[]> = new Map();

  // Khởi tạo cho loại rương đầu tiên cần đến
  const firstPositions = chestPositions.get(startChest)!;
  const firstDp: { dist: number; prevChest: number; prevPosIndex: number }[] = [];
  
  for (let i = 0; i < firstPositions.length; i++) {
    const pos = firstPositions[i];
    const dist = euclideanDistance(startPos, pos);
    firstDp.push({ dist, prevChest: -1, prevPosIndex: -1 });
  }
  dp.set(startChest, firstDp);

  // DP cho các loại tiếp theo
  let prevChestLevel = startChest;
  for (let chest = startChest + 1; chest <= p; chest++) {
    const currentPositions = chestPositions.get(chest)!;
    const prevPositions = chestPositions.get(prevChestLevel)!;
    const prevDp = dp.get(prevChestLevel)!;
    
    const currentDp: { dist: number; prevChest: number; prevPosIndex: number }[] = [];

    for (let i = 0; i < currentPositions.length; i++) {
      const currentPos = currentPositions[i];
      let minDist = Infinity;
      let bestPrevIndex = 0;

      for (let j = 0; j < prevPositions.length; j++) {
        const prevPos = prevPositions[j];
        const dist = prevDp[j].dist + euclideanDistance(prevPos, currentPos);
        if (dist < minDist) {
          minDist = dist;
          bestPrevIndex = j;
        }
      }

      currentDp.push({ dist: minDist, prevChest: prevChestLevel, prevPosIndex: bestPrevIndex });
    }

    dp.set(chest, currentDp);
    prevChestLevel = chest;
  }

  // Tìm ô tốt nhất của loại p (kho báu)
  const finalDp = dp.get(p)!;
  let bestFinalIndex = 0;
  let bestFinalDist = finalDp[0].dist;

  for (let i = 1; i < finalDp.length; i++) {
    if (finalDp[i].dist < bestFinalDist) {
      bestFinalDist = finalDp[i].dist;
      bestFinalIndex = i;
    }
  }

  // Truy vết để tìm đường đi
  const path: { chest: number; posIndex: number }[] = [];
  let currentChest = p;
  let currentPosIndex = bestFinalIndex;

  while (currentChest >= startChest) {
    path.push({ chest: currentChest, posIndex: currentPosIndex });
    const dpEntry = dp.get(currentChest)![currentPosIndex];
    if (dpEntry.prevChest === -1) break;
    currentChest = dpEntry.prevChest;
    currentPosIndex = dpEntry.prevPosIndex;
  }

  path.reverse();

  // Tạo các bước đi
  const steps: Step[] = [];
  let fromPos = startPos;

  for (const { chest, posIndex } of path) {
    const toPos = chestPositions.get(chest)![posIndex];
    
    // Bỏ qua nếu vị trí trùng với vị trí hiện tại
    if (fromPos.row === toPos.row && fromPos.col === toPos.col) {
      continue;
    }

    const distance = euclideanDistance(fromPos, toPos);
    steps.push({
      from: { ...fromPos },
      to: { ...toPos },
      chestNumber: chest,
      distance,
    });

    fromPos = toPos;
  }

  return steps;
}

/**
 * Tính tổng nhiên liệu từ các bước đi
 */
export function calculateTotalFuel(steps: Step[]): number {
  return steps.reduce((total, step) => total + step.distance, 0);
}

/**
 * Tạo GameState hoàn chỉnh từ ma trận
 */
export function createGameState(
  matrix: Matrix,
  n: number,
  m: number,
  p: number
): GameState {
  const allChestPositions = findChestPositions(matrix, p);
  const steps = calculatePath(matrix, p);
  const totalFuel = calculateTotalFuel(steps);

  // Tạo Map với vị trí đầu tiên của mỗi loại rương (để tương thích với UI)
  const chestPositions = new Map<number, Position>();
  for (let chest = 1; chest <= p; chest++) {
    const positions = allChestPositions.get(chest);
    if (positions && positions.length > 0) {
      // Lấy vị trí đầu tiên (hoặc có thể lấy vị trí gần (1,1) nhất)
      chestPositions.set(chest, positions[0]);
    }
  }

  return {
    matrix,
    n,
    m,
    p,
    steps,
    totalFuel,
    chestPositions,
  };
}

/**
 * Kiểm tra xem một số có phải là số nguyên không (với sai số nhỏ)
 */
function isInteger(value: number, epsilon: number = 1e-10): boolean {
  return Math.abs(value - Math.round(value)) < epsilon;
}

/**
 * Tìm số chính phương lớn nhất chia hết n
 */
function findLargestSquareFactor(n: number): number {
  if (n <= 0) return 1;
  let largestSquare = 1;
  for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
    const square = i * i;
    if (n % square === 0) {
      largestSquare = square;
      break;
    }
  }
  return largestSquare;
}

/**
 * Đơn giản hóa căn bậc 2: tìm a và b sao cho value = a * √b
 * với b không có số chính phương nào
 */
function simplifySqrt(value: number): { a: number; b: number } | null {
  // Kiểm tra xem value^2 có phải là số nguyên không
  const squared = value * value;
  if (!isInteger(squared)) {
    return null;
  }

  const n = Math.round(squared);
  if (n < 0) return null;

  // Tìm số chính phương lớn nhất chia hết n
  const largestSquare = findLargestSquareFactor(n);
  const a = Math.sqrt(largestSquare);
  const b = n / largestSquare;

  // Kiểm tra lại: a * √b có bằng value không
  const checkValue = a * Math.sqrt(b);
  if (Math.abs(checkValue - value) < 1e-10) {
    return { a: Math.round(a), b };
  }

  return null;
}

/**
 * Format số dưới dạng số nguyên hoặc căn bậc 2 với LaTeX
 * Ví dụ: 5 → "5", √2 → "\sqrt{2}", 2√3 → "2\sqrt{3}", 3.14159 → "3.141590"
 */
export function formatFuel(fuel: number, decimals: number = 6): string {
  // Kiểm tra số nguyên
  if (isInteger(fuel)) {
    return Math.round(fuel).toString();
  }

  // Thử đơn giản hóa thành dạng căn
  const simplified = simplifySqrt(fuel);
  if (simplified) {
    const { a, b } = simplified;
    if (a === 1 && b === 1) {
      return '1';
    } else if (a === 1) {
      return `\\sqrt{${b}}`;
    } else if (b === 1) {
      return a.toString();
    } else {
      return `${a}\\sqrt{${b}}`;
    }
  }

  // Nếu không thể đơn giản hóa, hiển thị số thập phân
  return fuel.toFixed(decimals);
}

/**
 * Kiểm tra xem string có chứa LaTeX không
 */
export function isLatex(value: string): boolean {
  return value.includes('\\sqrt');
}
