import { useState, useCallback } from 'react';
import { Box, Paper, Tabs, Tab, Button, Alert, Divider, TextField, Snackbar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import UpdateIcon from '@mui/icons-material/Update';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import { ParamsInput } from './ParamsInput';
import { ManualGridInput } from './ManualGridInput';
import { TextAreaInput } from './TextAreaInput';
import { RandomGenerator } from './RandomGenerator';
import { HistoryTab } from './HistoryTab';
import { useHistory } from '@/hooks/useHistory';
import type { Matrix, InputParams, InputMode, GameState, SaveMapRequest, UpdateMapRequest } from '@/types';
import { createEmptyMatrix, parseMatrixFromText, validateParams } from '@/utils/validation';

interface InputPanelProps {
  onCalculate: (matrix: Matrix, params: InputParams) => void;
  onReset: () => void;
  onLoadFromHistory: (gameState: GameState) => void;
  isCalculating: boolean;
  error: string | null;
  currentMatrix: Matrix | null;
  currentParams: InputParams | null;
}

type MainTab = 'input' | 'history';

export function InputPanel({
  onCalculate,
  onReset,
  onLoadFromHistory,
  isCalculating,
  error,
  currentMatrix,
  currentParams
}: InputPanelProps) {
  const [params, setParams] = useState<InputParams>({ n: 3, m: 3, p: 3 });
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [matrix, setMatrix] = useState<Matrix>(() => createEmptyMatrix(3, 3));
  const [textAreaValue, setTextAreaValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>('input');
  const [mapName, setMapName] = useState('');

  // State cho chế độ edit
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // History hook
  const {
    historyList,
    isLoading: isLoadingHistory,
    isSaving,
    isDeleting,
    error: historyError,
    isOnline,
    saveSuccess,
    deleteSuccess,
    fetchHistory,
    loadMap,
    saveMap,
    updateMap,
    deleteMap,
    clearSaveSuccess,
    clearDeleteSuccess
  } = useHistory();

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

  const handleMainTabChange = (_: React.SyntheticEvent, newTab: MainTab) => {
    setMainTab(newTab);
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
      const { matrix: parsedMatrix, error: parseError } = parseMatrixFromText(textAreaValue, params.n, params.m);
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

  const handleSave = async () => {
    // Sử dụng matrix hiện tại đang hiển thị (có thể từ input hoặc từ history đã load)
    const matrixToSave = currentMatrix || matrix;
    const paramsToSave = currentParams || params;

    if (!matrixToSave || matrixToSave.length === 0) {
      setLocalError('Không có dữ liệu ma trận để lưu. Vui lòng tính toán trước.');
      return;
    }

    const saveData: SaveMapRequest = {
      pirate_treasure_name: mapName || `Bản đồ ${new Date().toLocaleString('vi-VN')}`,
      map_rows: paramsToSave.n,
      map_columns: paramsToSave.m,
      treasure_chest_number: paramsToSave.p,
      Matrix: matrixToSave
    };

    await saveMap(saveData);
  };

  const handleReset = () => {
    setParams({ n: 3, m: 3, p: 3 });
    setMatrix(createEmptyMatrix(3, 3));
    setTextAreaValue('');
    setLocalError(null);
    setMapName('');
    setEditingMapId(null);
    setIsEditMode(false);
    onReset();
  };

  const handleRandomGenerate = (generatedMatrix: Matrix) => {
    setMatrix(generatedMatrix);
    setInputMode('manual'); // Switch to manual mode to show the generated matrix
  };

  // Khi click "Xem" từ lịch sử - chỉ hiển thị trên bản đồ, không chuyển tab
  const handleViewMap = (gameState: GameState) => {
    onLoadFromHistory(gameState);
  };

  // Khi click "Sửa" từ lịch sử - chuyển qua tab nhập liệu với dữ liệu đã load
  const handleEditMap = (gameState: GameState, name: string, mapId: string) => {
    // Cập nhật state local
    setParams({ n: gameState.n, m: gameState.m, p: gameState.p });
    setMatrix(gameState.matrix);
    setMapName(name);
    setEditingMapId(mapId);
    setIsEditMode(true);
    // Chuyển về tab input để hiển thị
    setMainTab('input');
    setInputMode('manual');
    // Gọi callback để update UI chính
    onLoadFromHistory(gameState);
  };

  // Hủy chế độ edit
  const handleCancelEdit = () => {
    setEditingMapId(null);
    setIsEditMode(false);
  };

  // Cập nhật bản đồ
  const handleUpdate = async () => {
    if (!editingMapId) return;

    const matrixToUpdate = currentMatrix || matrix;
    const paramsToUpdate = currentParams || params;

    if (!matrixToUpdate || matrixToUpdate.length === 0) {
      setLocalError('Không có dữ liệu ma trận để cập nhật.');
      return;
    }

    const updateData: UpdateMapRequest = {
      pirate_treasure_name: mapName || `Bản đồ ${new Date().toLocaleString('vi-VN')}`,
      map_rows: paramsToUpdate.n,
      map_columns: paramsToUpdate.m,
      treasure_chest_number: paramsToUpdate.p,
      Matrix: matrixToUpdate
    };

    const success = await updateMap(editingMapId, updateData);
    if (success) {
      setEditingMapId(null);
      setIsEditMode(false);
    }
  };

  const displayError = localError || error;
  const canSave = (currentMatrix && currentMatrix.length > 0) || (matrix && matrix.length > 0);

  return (
    <Paper elevation={2} className='p-4! h-full!'>
      {/* Main Tabs: Nhập liệu | Lịch sử */}
      <Tabs
        value={mainTab}
        onChange={handleMainTabChange}
        variant='fullWidth'
        className='mb-4! -mx-4! -mt-4! bg-gray-50 rounded-t-lg'
      >
        <Tab icon={<EditIcon />} iconPosition='start' label='Nhập liệu' value='input' />
        <Tab icon={<HistoryIcon />} iconPosition='start' label='Lịch sử' value='history' />
      </Tabs>

      {/* Tab: Nhập liệu */}
      {mainTab === 'input' && (
        <Box className='space-y-4!'>
          {/* Tên bản đồ */}
          <TextField
            label='Tên bản đồ (tùy chọn)'
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            size='small'
            fullWidth
            placeholder='VD: Bản đồ test 1'
          />

          <ParamsInput params={params} onChange={handleParamsChange} disabled={isCalculating || isSaving} />

          <Divider />

          <Tabs value={inputMode} onChange={handleModeChange} variant='fullWidth' className='mb-4!'>
            <Tab label='Nhập tay' value='manual' />
            <Tab label='Nhập text' value='textarea' />
            <Tab label='Ngẫu nhiên' value='random' />
          </Tabs>

          <Box className='min-h-48!'>
            {inputMode === 'manual' && (
              <ManualGridInput
                matrix={matrix}
                onChange={setMatrix}
                n={params.n}
                m={params.m}
                p={params.p}
                disabled={isCalculating || isSaving}
              />
            )}

            {inputMode === 'textarea' && (
              <TextAreaInput
                value={textAreaValue}
                onChange={setTextAreaValue}
                n={params.n}
                m={params.m}
                disabled={isCalculating || isSaving}
              />
            )}

            {inputMode === 'random' && (
              <RandomGenerator
                onGenerate={handleRandomGenerate}
                n={params.n}
                m={params.m}
                p={params.p}
                disabled={isCalculating || isSaving}
              />
            )}
          </Box>

          {displayError && (
            <Alert severity='error' className='whitespace-pre-line'>
              {displayError}
            </Alert>
          )}

          {historyError && (
            <Alert severity='warning' className='whitespace-pre-line'>
              {historyError}
            </Alert>
          )}

          <Divider />

          {/* Hiển thị badge khi đang ở chế độ edit */}
          {isEditMode && (
            <Alert severity='info' className='mb-2!'>
              Đang chỉnh sửa bản đồ "{mapName || 'Bản đồ không tên'}"
            </Alert>
          )}

          <Box className='flex gap-2 flex-wrap'>
            <Button
              variant='contained'
              color='primary'
              startIcon={<PlayArrowIcon />}
              onClick={handleCalculate}
              disabled={isCalculating || isSaving}
              className='flex-1'
            >
              {isCalculating ? 'Đang tính...' : 'Tính toán'}
            </Button>

            {isEditMode ? (
              <>
                <Button
                  variant='contained'
                  color='warning'
                  startIcon={<UpdateIcon />}
                  onClick={handleUpdate}
                  disabled={isCalculating || isSaving || !canSave}
                >
                  {isSaving ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
                <Button variant='outlined' onClick={handleCancelEdit} disabled={isCalculating || isSaving}>
                  Hủy
                </Button>
              </>
            ) : (
              <Button
                variant='contained'
                color='success'
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isCalculating || isSaving || !canSave}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu mới'}
              </Button>
            )}

            <Button
              variant='outlined'
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={isCalculating || isSaving}
            >
              Reset
            </Button>
          </Box>

          {!isOnline && (
            <Alert severity='info' className='mt-2!'>
              Không kết nối được server. Bạn vẫn có thể tính toán, nhưng không thể lưu.
            </Alert>
          )}
        </Box>
      )}

      {/* Tab: Lịch sử */}
      {mainTab === 'history' && (
        <HistoryTab
          historyList={historyList}
          isLoading={isLoadingHistory}
          isDeleting={isDeleting}
          error={historyError}
          isOnline={isOnline}
          onRefresh={fetchHistory}
          onLoadMap={loadMap}
          onEditMap={handleEditMap}
          onViewMap={handleViewMap}
          onDeleteMap={deleteMap}
        />
      )}

      {/* Snackbar thông báo lưu thành công */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={clearSaveSuccess}
        message='Đã lưu bản đồ thành công!'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Snackbar thông báo xóa thành công */}
      <Snackbar
        open={deleteSuccess}
        autoHideDuration={3000}
        onClose={clearDeleteSuccess}
        message='Đã xóa bản đồ thành công!'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
}
