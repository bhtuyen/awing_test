import { InlineMath } from 'react-katex';

interface MathDisplayProps {
  value: string; // LaTeX string hoặc số thường
}

/**
 * Component hiển thị công thức toán học với KaTeX
 */
export function MathDisplay({ value }: MathDisplayProps) {
  // Kiểm tra xem có phải LaTeX không (có chứa \sqrt)
  if (value.includes('\\sqrt')) {
    return <InlineMath math={value} />;
  }
  
  // Hiển thị số thường
  return <span>{value}</span>;
}
