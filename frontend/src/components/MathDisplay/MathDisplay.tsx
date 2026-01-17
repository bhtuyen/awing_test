import { Box } from '@mui/material';
import { InlineMath } from 'react-katex';
import type { FormattedFuel } from '@/utils/algorithm';

interface MathDisplayProps {
  value: FormattedFuel; // FormattedFuel object
}

/**
 * Component hiển thị công thức toán học với KaTeX
 * Hiển thị dạng căn kèm giá trị xấp xỉ nếu có
 */
export function MathDisplay({ value }: MathDisplayProps) {
  const { latex, approximate, isSqrt } = value;
  
  // Nếu là dạng căn, hiển thị kèm giá trị xấp xỉ
  if (isSqrt && approximate) {
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <InlineMath math={latex} />
        <Box component="span" sx={{ fontSize: '0.85em', opacity: 0.8 }}>
          ≈ {approximate}
        </Box>
      </Box>
    );
  }
  
  // Kiểm tra xem có phải LaTeX không (có chứa \sqrt)
  if (latex.includes('\\sqrt')) {
    return <InlineMath math={latex} />;
  }
  
  // Hiển thị số thường
  return <span>{latex}</span>;
}
