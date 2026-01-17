import { useState, useCallback, useEffect } from 'react';
import type { PirateTreasureListItem, SaveMapRequest, UpdateMapRequest, GameState } from '@/types';
import { convertDetailToGameState } from '@/types';
import { pirateTreasureApi } from '@/services/api';

interface UseHistoryReturn {
  // State
  historyList: PirateTreasureListItem[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  isOnline: boolean;
  saveSuccess: boolean;
  deleteSuccess: boolean;

  // Actions
  fetchHistory: () => Promise<void>;
  loadMap: (id: string) => Promise<GameState | null>;
  saveMap: (data: SaveMapRequest) => Promise<boolean>;
  updateMap: (id: string, data: UpdateMapRequest) => Promise<boolean>;
  deleteMap: (id: string) => Promise<boolean>;
  clearError: () => void;
  clearSaveSuccess: () => void;
  clearDeleteSuccess: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [historyList, setHistoryList] = useState<PirateTreasureListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Kiểm tra kết nối khi component mount
  useEffect(() => {
    const checkConnection = async () => {
      const online = await pirateTreasureApi.healthCheck();
      setIsOnline(online);
    };
    checkConnection();
  }, []);

  /**
   * Lấy danh sách lịch sử từ API
   */
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await pirateTreasureApi.getAll();

    if (response.success && response.data) {
      setHistoryList(response.data);
      setIsOnline(true);
    } else {
      setError(response.error || 'Không thể tải danh sách');
      setIsOnline(false);
    }

    setIsLoading(false);
  }, []);

  /**
   * Load chi tiết bản đồ và convert sang GameState
   */
  const loadMap = useCallback(async (id: string): Promise<GameState | null> => {
    setIsLoading(true);
    setError(null);

    const response = await pirateTreasureApi.getById(id);

    setIsLoading(false);

    if (response.success && response.data) {
      setIsOnline(true);
      return convertDetailToGameState(response.data);
    } else {
      setError(response.error || 'Không thể tải chi tiết bản đồ');
      setIsOnline(false);
      return null;
    }
  }, []);

  /**
   * Lưu bản đồ mới
   */
  const saveMap = useCallback(
    async (data: SaveMapRequest): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      const response = await pirateTreasureApi.save(data);

      setIsSaving(false);

      if (response.success) {
        setIsOnline(true);
        setSaveSuccess(true);
        // Refresh danh sách sau khi save thành công
        fetchHistory();
        return true;
      } else {
        setError(response.error || 'Không thể lưu bản đồ');
        setIsOnline(false);
        return false;
      }
    },
    [fetchHistory]
  );

  /**
   * Cập nhật bản đồ
   */
  const updateMap = useCallback(
    async (id: string, data: UpdateMapRequest): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      const response = await pirateTreasureApi.update(id, data);

      setIsSaving(false);

      if (response.success) {
        setIsOnline(true);
        setSaveSuccess(true);
        // Refresh danh sách sau khi update thành công
        fetchHistory();
        return true;
      } else {
        setError(response.error || 'Không thể cập nhật bản đồ');
        setIsOnline(false);
        return false;
      }
    },
    [fetchHistory]
  );

  /**
   * Xóa bản đồ
   */
  const deleteMap = useCallback(
    async (id: string): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);
      setDeleteSuccess(false);

      const response = await pirateTreasureApi.delete(id);

      setIsDeleting(false);

      if (response.success) {
        setIsOnline(true);
        setDeleteSuccess(true);
        // Refresh danh sách sau khi delete thành công
        fetchHistory();
        return true;
      } else {
        setError(response.error || 'Không thể xóa bản đồ');
        setIsOnline(false);
        return false;
      }
    },
    [fetchHistory]
  );

  /**
   * Xóa thông báo lỗi
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Xóa thông báo lưu thành công
   */
  const clearSaveSuccess = useCallback(() => {
    setSaveSuccess(false);
  }, []);

  /**
   * Xóa thông báo xóa thành công
   */
  const clearDeleteSuccess = useCallback(() => {
    setDeleteSuccess(false);
  }, []);

  return {
    historyList,
    isLoading,
    isSaving,
    isDeleting,
    error,
    isOnline,
    saveSuccess,
    deleteSuccess,
    fetchHistory,
    loadMap,
    saveMap,
    updateMap,
    deleteMap,
    clearError,
    clearSaveSuccess,
    clearDeleteSuccess
  };
}
