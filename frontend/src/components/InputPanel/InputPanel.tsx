import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Alert,
  Divider,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ParamsInput } from './ParamsInput';
import { ManualGridInput } from './ManualGridInput';
import { TextAreaInput } from './TextAreaInput';
import { RandomGenerator } from './RandomGenerator';
import type { Matrix, InputParams, InputMode } from '@/types';
import {
  createEmptyMatrix,
  parseMatrixFromText,
  validateParams,
} from '@/utils/validation';

interface InputPanelProps {
  onCalculate: (matrix: Matrix, params: InputParams) => void;
  onReset: () => void;
  isCalculating: boolean;
  error: string | null;
}

export function InputPanel({
  onCalculate,
  onReset,
  isCalculating,
  error,
}: InputPanelProps) {
  const [params, setParams] = useState<InputParams>({ n: 3, m: 3, p: 3 });
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [matrix, setMatrix] = useState<Matrix>(() => createEmptyMatrix(3, 3));
  const [textAreaValue, setTextAreaValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Cập nhật ma trận khi params thay đổi
  const updateMatrixForParams = useCallback((n: number, m: number, p: number, prevMatrix: Matrix) => {
    if (n <= 0 || m <= 0) return prevMatrix;
    
    const newMatrix: Matrix = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < m; j++) {
        const oldValue = prevMatrix[i]?.[j];
        row.push(oldValue && oldValue <= p ? oldValue : 1);
      }
      newMatrix.push(row);
    }
    return newMatrix;
  }, []);

  const handleParamsChange = (newParams: InputParams) => {
    setParams(newParams);
    if (newParams.n > 0 && newParams.m > 0) {
      setMatrix((prev) => updateMatrixForParams(newParams.n, newParams.m, newParams.p, prev));
    }
  };

  const handleModeChange = (_: React.SyntheticEvent, newMode: InputMode) => {
    setInputMode(newMode);
    setLocalError(null);
  };

  const handleCalculate = () => {
    setLocalError(null);

    // Validate params first
    const paramsValidation = validateParams(params);
    if (!paramsValidation.isValid) {
      setLocalError(paramsValidation.errors.join('\n'));
      return;
    }

    let finalMatrix: Matrix;

    if (inputMode === 'textarea') {
      const { matrix: parsedMatrix, error: parseError } = parseMatrixFromText(
        textAreaValue,
        params.n,
        params.m
      );
      if (parseError || !parsedMatrix) {
        setLocalError(parseError || 'Không thể parse ma trận');
        return;
      }
      finalMatrix = parsedMatrix;
    } else {
      finalMatrix = matrix;
    }

    onCalculate(finalMatrix, params);
  };

  const handleReset = () => {
    setParams({ n: 3, m: 3, p: 3 });
    setMatrix(createEmptyMatrix(3, 3));
    setTextAreaValue('');
    setLocalError(null);
    onReset();
  };

  const handleRandomGenerate = (generatedMatrix: Matrix) => {
    setMatrix(generatedMatrix);
    setInputMode('manual'); // Switch to manual mode to show the generated matrix
  };

  const displayError = localError || error;

  return (
    <Paper elevation={2} className="p-4! h-full!">
      <Typography variant="h6" className="mb-4! font-bold text-gray-800">
        Nhập dữ liệu
      </Typography>

      <Box className="space-y-4!">
        <ParamsInput
          params={params}
          onChange={handleParamsChange}
          disabled={isCalculating}
        />

        <Divider />

        <Tabs
          value={inputMode}
          onChange={handleModeChange}
          variant="fullWidth"
          className="mb-4!"
        >
          <Tab label="Nhập tay" value="manual" />
          <Tab label="Nhập text" value="textarea" />
          <Tab label="Ngẫu nhiên" value="random" />
        </Tabs>

        <Box className="min-h-48!">
          {inputMode === 'manual' && (
            <ManualGridInput
              matrix={matrix}
              onChange={setMatrix}
              n={params.n}
              m={params.m}
              p={params.p}
              disabled={isCalculating}
            />
          )}

          {inputMode === 'textarea' && (
            <TextAreaInput
              value={textAreaValue}
              onChange={setTextAreaValue}
              n={params.n}
              m={params.m}
              disabled={isCalculating}
            />
          )}

          {inputMode === 'random' && (
            <RandomGenerator
              onGenerate={handleRandomGenerate}
              n={params.n}
              m={params.m}
              p={params.p}
              disabled={isCalculating}
            />
          )}
        </Box>

        {displayError && (
          <Alert severity="error" className="whitespace-pre-line">
            {displayError}
          </Alert>
        )}

        <Divider />

        <Box className="flex gap-2">
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1"
          >
            {isCalculating ? 'Đang tính...' : 'Tính toán'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            disabled={isCalculating}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
