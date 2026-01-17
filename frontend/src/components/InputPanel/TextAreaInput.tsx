import { TextField, Box, Typography } from '@mui/material';
  
interface TextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  n: number;
  m: number;
  disabled?: boolean;
}

export function TextAreaInput({
  value,
  onChange,
  n,
  m,
  disabled = false,
}: TextAreaInputProps) {
  const placeholder = generatePlaceholder(n, m);

  return (
    <Box className="space-y-2!">
      <Typography variant="subtitle2" className="text-gray-600">
        Nhập ma trận (mỗi hàng một dòng, các số cách nhau bởi dấu cách)
      </Typography>

      <TextField
        multiline
        rows={Math.min(10, Math.max(4, n))}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        fullWidth
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            fontFamily: 'monospace',
            fontSize: '14px',
          },
        }}
      />

      <Typography variant="caption" className="text-gray-500 block">
        Format: {n} hàng × {m} cột. Ví dụ: "1 2 3" cho một hàng 3 cột.
      </Typography>
    </Box>
  );
}

function generatePlaceholder(n: number, m: number): string {
  if (n === 0 || m === 0) {
    return 'Vui lòng nhập n và m trước';
  }

  const lines: string[] = [];
  for (let i = 0; i < Math.min(n, 5); i++) {
    const row: number[] = [];
    for (let j = 0; j < m; j++) {
      row.push(((i * m + j) % 9) + 1);
    }
    lines.push(row.join(' '));
  }

  if (n > 5) {
    lines.push('...');
  }

  return lines.join('\n');
}
