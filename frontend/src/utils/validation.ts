import type { Matrix, ValidationResult, InputParams } from '@/types';

/**
 * Validate params n, m, p
 */
export function validateParams(params: InputParams): ValidationResult {
  const errors: string[] = [];
  const { n, m, p } = params;

  // Validate n
  if (!Number.isInteger(n) || n < 1 || n > 500) {
    errors.push('Số hàng n phải là số nguyên từ 1 đến 500');
  }

  // Validate m
  if (!Number.isInteger(m) || m < 1 || m > 500) {
    errors.push('Số cột m phải là số nguyên từ 1 đến 500');
  }

  // Validate p
  if (!Number.isInteger(p) || p < 1) {
    errors.push('Số loại rương p phải là số nguyên dương');
  }

  // p không được lớn hơn n * m
  if (n > 0 && m > 0 && p > n * m) {
    errors.push(`Số loại rương p (${p}) không được lớn hơn n × m (${n * m})`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate ma trận
 */
export function validateMatrix(matrix: Matrix, n: number, m: number, p: number): ValidationResult {
  const errors: string[] = [];

  // Kiểm tra kích thước ma trận
  if (matrix.length !== n) {
    errors.push(`Ma trận phải có ${n} hàng, nhưng có ${matrix.length} hàng`);
    return { isValid: false, errors };
  }

  // Kiểm tra số cột mỗi hàng
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].length !== m) {
      errors.push(`Hàng ${i + 1} phải có ${m} cột, nhưng có ${matrix[i].length} cột`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Đếm số lần xuất hiện của từng loại rương
  const chestCount = new Map<number, number>();

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const value = matrix[i][j];

      // Kiểm tra giá trị hợp lệ
      if (!Number.isInteger(value) || value < 1 || value > p) {
        errors.push(`Giá trị tại ô (${i + 1}, ${j + 1}) phải là số nguyên từ 1 đến ${p}, nhưng là ${value}`);
        continue;
      }

      chestCount.set(value, (chestCount.get(value) || 0) + 1);
    }
  }

  // Kiểm tra các rương từ 1 đến p-1 phải xuất hiện ít nhất 1 lần
  // (cần thiết để có đường đi đến kho báu)
  for (let chest = 1; chest < p; chest++) {
    const count = chestCount.get(chest) || 0;
    if (count === 0) {
      errors.push(
        `Rương số ${chest} không xuất hiện trong ma trận. Cần có các rương từ 1 đến ${p - 1} để có đường đi đến kho báu (rương ${p})`
      );
    }
  }

  // Kiểm tra rương p (kho báu) phải xuất hiện đúng 1 lần
  const treasureCount = chestCount.get(p) || 0;
  if (treasureCount === 0) {
    errors.push(`Kho báu (rương số ${p}) không xuất hiện trong ma trận`);
  } else if (treasureCount !== 1) {
    errors.push(`Kho báu (rương số ${p}) phải xuất hiện đúng 1 lần, nhưng xuất hiện ${treasureCount} lần`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Parse ma trận từ text (textarea input)
 * Format: mỗi hàng là các số cách nhau bởi dấu cách hoặc tab
 */
export function parseMatrixFromText(
  text: string,
  n: number,
  m: number
): { matrix: Matrix | null; error: string | null } {
  try {
    const lines = text
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '');

    if (lines.length !== n) {
      return {
        matrix: null,
        error: `Cần ${n} hàng, nhưng nhập ${lines.length} hàng`
      };
    }

    const matrix: Matrix = [];

    for (let i = 0; i < lines.length; i++) {
      const values = lines[i]
        .trim()
        .split(/[\s,]+/)
        .map((v) => parseInt(v, 10));

      if (values.length !== m) {
        return {
          matrix: null,
          error: `Hàng ${i + 1} cần ${m} giá trị, nhưng có ${values.length} giá trị`
        };
      }

      if (values.some((v) => isNaN(v))) {
        return {
          matrix: null,
          error: `Hàng ${i + 1} chứa giá trị không phải số`
        };
      }

      matrix.push(values);
    }

    return { matrix, error: null };
  } catch {
    return {
      matrix: null,
      error: 'Không thể parse ma trận từ text'
    };
  }
}

/**
 * Sinh ma trận ngẫu nhiên hợp lệ
 */
export function generateRandomMatrix(n: number, m: number, p: number): Matrix {
  const matrix: Matrix = [];
  const totalCells = n * m;

  // Tạo ma trận với giá trị ngẫu nhiên từ 1 đến p-1
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < m; j++) {
      // Giá trị từ 1 đến p-1 (không bao gồm kho báu)
      row.push(Math.floor(Math.random() * (p - 1)) + 1);
    }
    matrix.push(row);
  }

  // Đảm bảo mỗi số từ 1 đến p-1 xuất hiện ít nhất 1 lần
  const usedPositions = new Set<string>();

  for (let chest = 1; chest < p; chest++) {
    let row: number, col: number;
    let key: string;

    // Tìm vị trí chưa được gán cho rương bắt buộc
    do {
      row = Math.floor(Math.random() * n);
      col = Math.floor(Math.random() * m);
      key = `${row},${col}`;
    } while (usedPositions.has(key) && usedPositions.size < totalCells);

    matrix[row][col] = chest;
    usedPositions.add(key);
  }

  // Đặt kho báu (số p) ở một vị trí ngẫu nhiên chưa sử dụng
  let treasureRow: number, treasureCol: number;
  let treasureKey: string;

  do {
    treasureRow = Math.floor(Math.random() * n);
    treasureCol = Math.floor(Math.random() * m);
    treasureKey = `${treasureRow},${treasureCol}`;
  } while (usedPositions.has(treasureKey) && usedPositions.size < totalCells);

  matrix[treasureRow][treasureCol] = p;

  return matrix;
}

/**
 * Tạo ma trận rỗng
 */
export function createEmptyMatrix(n: number, m: number): Matrix {
  return Array(n)
    .fill(null)
    .map(() => Array(m).fill(1));
}
