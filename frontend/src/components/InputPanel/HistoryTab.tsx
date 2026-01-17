import { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MapIcon from '@mui/icons-material/Map';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import RouteIcon from '@mui/icons-material/Route';
import type { PirateTreasureListItem, GameState } from '@/types';

interface HistoryTabProps {
  historyList: PirateTreasureListItem[];
  isLoading: boolean;
  isDeleting: boolean;
  error: string | null;
  isOnline: boolean;
  onRefresh: () => void;
  onLoadMap: (id: string) => Promise<GameState | null>;
  onEditMap: (gameState: GameState, mapName: string, mapId: string) => void;
  onViewMap: (gameState: GameState) => void;
  onDeleteMap: (id: string) => Promise<boolean>;
}

export function HistoryTab({
  historyList,
  isLoading,
  isDeleting,
  error,
  isOnline,
  onRefresh,
  onLoadMap,
  onEditMap,
  onViewMap,
  onDeleteMap
}: HistoryTabProps) {
  // State cho dialog xác nhận xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PirateTreasureListItem | null>(null);

  // State cho item đang được chọn và chi tiết
  const [selectedItem, setSelectedItem] = useState<PirateTreasureListItem | null>(null);
  const [selectedGameState, setSelectedGameState] = useState<GameState | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Fetch history on mount
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const handleItemClick = async (item: PirateTreasureListItem) => {
    // Nếu click vào item đang chọn, bỏ chọn
    if (selectedItem?.pirateTreasureId === item.pirateTreasureId) {
      setSelectedItem(null);
      setSelectedGameState(null);
      return;
    }

    setSelectedItem(item);
    setIsLoadingDetail(true);

    const gameState = await onLoadMap(item.pirateTreasureId);
    if (gameState) {
      setSelectedGameState(gameState);
    }
    setIsLoadingDetail(false);
  };

  const handleEditClick = () => {
    if (selectedGameState && selectedItem) {
      onEditMap(selectedGameState, selectedItem.pirateTreasureName, selectedItem.pirateTreasureId);
    }
  };

  const handleViewClick = () => {
    if (selectedGameState) {
      onViewMap(selectedGameState);
    }
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    setSelectedGameState(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: PirateTreasureListItem) => {
    e.stopPropagation(); // Ngăn không cho click vào item
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      const success = await onDeleteMap(itemToDelete.pirateTreasureId);
      if (success && selectedItem?.pirateTreasureId === itemToDelete.pirateTreasureId) {
        // Nếu xóa item đang chọn, reset selection
        setSelectedItem(null);
        setSelectedGameState(null);
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box className='h-full flex flex-col'>
      {/* Header */}
      <Box className='flex items-center justify-between mb-3!'>
        <Typography variant='subtitle1' className='font-semibold text-gray-700'>
          Bản đồ đã lưu
        </Typography>
        <Box className='flex items-center gap-2'>
          {!isOnline && (
            <Tooltip title='Không kết nối được server'>
              <CloudOffIcon color='error' fontSize='small' />
            </Tooltip>
          )}
          <Tooltip title='Làm mới danh sách'>
            <IconButton onClick={onRefresh} disabled={isLoading} size='small'>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity='error' className='mb-3!' onClose={() => { }}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <Box className='flex justify-center items-center py-8'>
          <CircularProgress size={32} />
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && historyList.length === 0 && !error && (
        <Box className='flex flex-col items-center justify-center py-8 text-gray-500'>
          <MapIcon className='text-4xl! mb-2! opacity-50' />
          <Typography variant='body2'>Chưa có bản đồ nào được lưu</Typography>
          <Typography variant='caption' className='text-gray-400'>
            Tính toán và lưu bản đồ để xem lại sau
          </Typography>
        </Box>
      )}

      {/* History list */}
      {!isLoading && historyList.length > 0 && (
        <Box className='flex flex-col flex-1 overflow-hidden'>
          <List className={`overflow-auto -mx-2! ${selectedItem ? 'max-h-40!' : 'flex-1'}`}>
            {historyList.map((item) => (
              <ListItem
                key={item.pirateTreasureId}
                disablePadding
                secondaryAction={
                  <Tooltip title='Xóa bản đồ'>
                    <IconButton
                      edge='end'
                      aria-label='delete'
                      onClick={(e) => handleDeleteClick(e, item)}
                      disabled={isDeleting}
                      size='small'
                      className='mr-1!'
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemButton
                  onClick={() => handleItemClick(item)}
                  selected={selectedItem?.pirateTreasureId === item.pirateTreasureId}
                  className='rounded-lg! mx-2! mb-1!'
                >
                  <ListItemText
                    disableTypography
                    primary={
                      <Box className='flex items-center gap-2'>
                        <Typography variant='body2' className='font-medium'>
                          {item.pirateTreasureName || 'Bản đồ không tên'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box className='flex items-center gap-2 mt-1! flex-wrap'>
                        <Chip
                          label={`${item.mapRows}×${item.mapColumns}`}
                          size='small'
                          variant='outlined'
                          className='text-xs!'
                        />
                        <Chip
                          label={`p=${item.treasureChestNumber}`}
                          size='small'
                          variant='outlined'
                          className='text-xs!'
                        />
                        <Chip
                          icon={<LocalGasStationIcon />}
                          label={item.totalFuel?.toFixed(2) || 0}
                          size='small'
                          color='warning'
                          className='text-xs!'
                        />
                        <Typography variant='caption' className='text-gray-400 ml-auto mr-6!'>
                          {formatDate(item.createdDate)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Chi tiết bản đồ được chọn */}
          {selectedItem && (
            <Paper elevation={1} className='mt-3! p-3! bg-blue-50! overflow-auto'>
              {/* Header chi tiết */}
              <Box className='flex items-center justify-between mb-2!'>
                <Typography variant='subtitle2' className='font-semibold text-blue-800'>
                  Chi tiết bản đồ
                </Typography>
                <IconButton size='small' onClick={handleCloseDetail}>
                  <CloseIcon fontSize='small' />
                </IconButton>
              </Box>

              <Divider className='mb-2!' />

              {isLoadingDetail ? (
                <Box className='flex justify-center items-center py-4'>
                  <CircularProgress size={24} />
                </Box>
              ) : selectedGameState ? (
                <Box className='space-y-2!'>
                  {/* Tên bản đồ */}
                  <Typography variant='body2' className='font-medium'>
                    {selectedItem.pirateTreasureName || 'Bản đồ không tên'}
                  </Typography>

                  {/* Thông tin cơ bản */}
                  <Box className='flex flex-wrap gap-2'>
                    <Chip
                      icon={<MapIcon />}
                      label={`Kích thước: ${selectedGameState.n}×${selectedGameState.m}`}
                      size='small'
                      variant='outlined'
                      color='primary'
                    />
                    <Chip
                      label={`Số rương: ${selectedGameState.p}`}
                      size='small'
                      variant='outlined'
                      color='secondary'
                    />
                  </Box>

                  {/* Kết quả tính toán */}
                  <Box className='flex flex-wrap gap-2'>
                    <Chip
                      icon={<RouteIcon />}
                      label={`Số bước: ${selectedGameState.steps.length}`}
                      size='small'
                      color='info'
                    />
                    <Chip
                      icon={<LocalGasStationIcon />}
                      label={`Nhiên liệu: ${selectedGameState.totalFuel?.toFixed(2) || 0}`}
                      size='small'
                      color='warning'
                    />
                  </Box>

                  {/* Preview ma trận nhỏ */}
                  <Box className='mt-2!'>
                    <Typography variant='caption' className='text-gray-600 mb-1! block'>
                      Ma trận ({selectedGameState.n}×{selectedGameState.m}):
                    </Typography>
                    <Box
                      className='bg-white rounded p-2! overflow-auto max-h-24! border border-gray-200'
                      sx={{ fontFamily: 'monospace', fontSize: '10px', lineHeight: 1.4 }}
                    >
                      {selectedGameState.matrix.slice(0, 8).map((row, i) => (
                        <Box key={i} className='whitespace-nowrap'>
                          {row.slice(0, 12).map((cell, j) => (
                            <span
                              key={j}
                              className={`inline-block w-4 text-center ${cell === selectedGameState.p ? 'text-red-600 font-bold' : ''}`}
                            >
                              {cell}
                            </span>
                          ))}
                          {row.length > 12 && <span className='text-gray-400'>...</span>}
                        </Box>
                      ))}
                      {selectedGameState.matrix.length > 8 && <Box className='text-gray-400 text-center'>...</Box>}
                    </Box>
                  </Box>

                  <Divider className='my-2!' />

                  {/* Nút hành động */}
                  <Box className='flex gap-2'>
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<VisibilityIcon />}
                      onClick={handleViewClick}
                      className='flex-1'
                    >
                      Xem
                    </Button>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<EditIcon />}
                      onClick={handleEditClick}
                      className='flex-1'
                    >
                      Sửa
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant='body2' className='text-gray-500'>
                  Không thể tải chi tiết bản đồ
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      )}

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Xác nhận xóa bản đồ</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Bạn có chắc chắn muốn xóa bản đồ "{itemToDelete?.pirateTreasureName || 'Bản đồ không tên'}"? Hành động này
            không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : null}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
