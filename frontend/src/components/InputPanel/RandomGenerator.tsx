import { Button, Box, Typography, Chip } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import type { Matrix } from '@/types';
import { generateRandomMatrix } from '@/utils/validation';

interface RandomGeneratorProps {
  onGenerate: (matrix: Matrix) => void;
  n: number;
  m: number;
  p: number;
  disabled?: boolean;
}

export function RandomGenerator({ onGenerate, n, m, p, disabled = false }: RandomGeneratorProps) {
  const canGenerate = n > 0 && m > 0 && p > 0 && p <= n * m;

  const handleGenerate = () => {
    if (!canGenerate) return;
    const matrix = generateRandomMatrix(n, m, p);
    onGenerate(matrix);
  };

  return (
    <Box className='space-y-4!'>
      <Typography variant='subtitle2' className='text-gray-600'>
        Sinh ma trận ngẫu nhiên với các tham số đã nhập
      </Typography>

      <Box className='flex flex-wrap gap-2!'>
        <Chip label={`${n} hàng`} size='small' variant='outlined' />
        <Chip label={`${m} cột`} size='small' variant='outlined' />
        <Chip label={`${p} loại rương`} size='small' variant='outlined' />
        <Chip label={`${n * m} ô tổng cộng`} size='small' variant='outlined' color='primary' />
      </Box>

      <Button
        variant='contained'
        startIcon={<CasinoIcon />}
        onClick={handleGenerate}
        disabled={disabled || !canGenerate}
        className='bg-linear-to-r from-purple-500 to-indigo-500'
      >
        Sinh ngẫu nhiên
      </Button>

      {!canGenerate && (
        <Typography variant='caption' className='text-amber-600 block'>
          Vui lòng nhập đầy đủ n, m, p hợp lệ để sinh ma trận
        </Typography>
      )}

      <Typography variant='caption' className='text-gray-500 block'>
        Ma trận sinh ra sẽ đảm bảo:
        <ul className='list-disc ml-4! mt-1!'>
          <li>Các rương từ 1 đến {p - 1} xuất hiện ít nhất 1 lần (cần thiết để có đường đi đến kho báu)</li>
          <li>Kho báu (rương {p}) chỉ xuất hiện đúng 1 lần</li>
        </ul>
      </Typography>
    </Box>
  );
}
