import type {
  PirateTreasureListItem,
  PirateTreasureDetail,
  SaveMapRequest,
  UpdateMapRequest,
  DeleteResponse
} from '@/types';

/**
 * Cấu hình API từ biến môi trường
 * Các biến môi trường phải có prefix VITE_ để Vite expose ra client
 */
const getEnvConfig = () => {
  // Load biến môi trường từ .env file
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiTimeout = import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT, 10) : 30000;
  const apiLogging = import.meta.env.VITE_API_LOGGING === 'true';

  // Validate và fallback
  const baseUrl = apiUrl || 'http://localhost:5029/api';

  // Đảm bảo URL không có trailing slash
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return {
    baseUrl: normalizedBaseUrl,
    timeout: apiTimeout,
    logging: apiLogging
  };
};

const envConfig = getEnvConfig();
const API_BASE = envConfig.baseUrl;
const API_TIMEOUT = envConfig.timeout;
const API_LOGGING = envConfig.logging;

// Log cấu hình trong development mode
if (import.meta.env.DEV && API_LOGGING) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE,
    timeout: API_TIMEOUT,
    logging: API_LOGGING
  });
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Helper function để thực hiện fetch với error handling và timeout
 */
async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    if (API_LOGGING && import.meta.env.DEV) {
      console.log(`📤 API Request: ${options?.method || 'GET'} ${url}`);
    }

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    clearTimeout(timeoutId);

    if (API_LOGGING && import.meta.env.DEV) {
      console.log(`📥 API Response: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;

      if (API_LOGGING && import.meta.env.DEV) {
        console.error('❌ API Error:', errorMessage);
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const timeoutError = `Request timeout sau ${API_TIMEOUT}ms`;
        if (API_LOGGING && import.meta.env.DEV) {
          console.error('⏱️', timeoutError);
        }
        return {
          success: false,
          error: timeoutError
        };
      }

      if (error.message.includes('fetch')) {
        const networkError = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        if (API_LOGGING && import.meta.env.DEV) {
          console.error('🌐', networkError);
        }
        return {
          success: false,
          error: networkError
        };
      }
    }

    const unknownError = error instanceof Error ? error.message : 'Lỗi không xác định';
    if (API_LOGGING && import.meta.env.DEV) {
      console.error('❓', unknownError);
    }
    return {
      success: false,
      error: unknownError
    };
  }
}

/**
 * Pirate Treasure API
 */
export const pirateTreasureApi = {
  /**
   * Lấy danh sách tất cả bản đồ đã lưu
   */
  getAll: async (): Promise<ApiResponse<PirateTreasureListItem[]>> => {
    return fetchWithErrorHandling<PirateTreasureListItem[]>(`${API_BASE}/PirateTreasures`);
  },

  /**
   * Lấy chi tiết bản đồ theo ID
   */
  getById: async (id: string): Promise<ApiResponse<PirateTreasureDetail>> => {
    return fetchWithErrorHandling<PirateTreasureDetail>(`${API_BASE}/PirateTreasures/${id}`);
  },

  /**
   * Lưu bản đồ mới
   */
  save: async (data: SaveMapRequest): Promise<ApiResponse<PirateTreasureDetail>> => {
    return fetchWithErrorHandling<PirateTreasureDetail>(`${API_BASE}/PirateTreasures`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Cập nhật bản đồ
   */
  update: async (id: string, data: UpdateMapRequest): Promise<ApiResponse<PirateTreasureDetail>> => {
    return fetchWithErrorHandling<PirateTreasureDetail>(`${API_BASE}/PirateTreasures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Xóa bản đồ theo ID
   */
  delete: async (id: string): Promise<ApiResponse<DeleteResponse>> => {
    return fetchWithErrorHandling<DeleteResponse>(`${API_BASE}/PirateTreasures/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * Kiểm tra kết nối đến server
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${API_BASE}/PirateTreasures/health`, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
};

/**
 * Export cấu hình API để có thể sử dụng ở nơi khác nếu cần
 */
export const apiConfig = {
  baseUrl: API_BASE,
  timeout: API_TIMEOUT,
  logging: API_LOGGING
};
