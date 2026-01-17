import { TextField, Box, Typography } from '@mui/material';
import type { InputParams } from '@/types';

interface ParamsInputProps {
  params: InputParams;
  onChange: (params: InputParams) => void;
  disabled?: boolean;
}

export function ParamsInput({ params, onChange, disabled = false }: ParamsInputProps) {
  const handleChange = (field: keyof InputParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    onChange({ ...params, [field]: value });
  };

  return (
    <Box className='space-y-4!'>
      <Typography variant='subtitle1' className='font-semibold text-gray-700'>
        Tham số đầu vào
      </Typography>

      <Box className='flex flex-wrap gap-4'>
        <TextField
          label='n (số hàng)'
          type='number'
          value={params.n || ''}
          onChange={handleChange('n')}
          disabled={disabled}
          size='small'
          slotProps={{
            htmlInput: { min: 1, max: 500 }
          }}
          className='w-32'
          helperText='1 ≤ n ≤ 500'
        />

        <TextField
          label='m (số cột)'
          type='number'
          value={params.m || ''}
          onChange={handleChange('m')}
          disabled={disabled}
          size='small'
          slotProps={{
            htmlInput: { min: 1, max: 500 }
          }}
          className='w-32'
          helperText='1 ≤ m ≤ 500'
        />

        <TextField
          label='p (rương kho báu)'
          type='number'
          value={params.p || ''}
          onChange={handleChange('p')}
          disabled={disabled}
          size='small'
          slotProps={{
            htmlInput: { min: 1, max: params.n * params.m || 1 }
          }}
          className='w-32'
          helperText={`1 ≤ p ≤ ${params.n * params.m || 'n×m'}`}
        />
      </Box>
    </Box>
  );
}
