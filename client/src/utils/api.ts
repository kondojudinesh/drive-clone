interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(name: string, email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // File endpoints
  async getFiles(folderId?: string) {
    const query = folderId ? `?folder_id=${folderId}` : '';
    return this.request(`/files${query}`);
  }

  async uploadFile(file: File, folderId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folder_id', folderId);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    return response.json();
  }

  async deleteFile(fileId: string) {
    return this.request(`/files/${fileId}`, { method: 'DELETE' });
  }

  async shareFile(fileId: string, isPublic: boolean) {
    return this.request(`/files/${fileId}/share`, {
      method: 'POST',
      body: JSON.stringify({ is_public: isPublic }),
    });
  }

  async createFolder(name: string, parentId?: string) {
    return this.request('/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parent_id: parentId }),
    });
  }

  async getTrashFiles() {
    return this.request('/files/trash');
  }

  async restoreFile(fileId: string) {
    return this.request(`/files/${fileId}/restore`, { method: 'POST' });
  }

  async permanentDeleteFile(fileId: string) {
    return this.request(`/files/${fileId}/permanent`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();