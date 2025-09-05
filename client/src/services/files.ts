import api from './api';

export interface FileItem {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  updated_at: string;
  is_trashed: boolean;
}

export const fileService = {
  async getFiles(): Promise<FileItem[]> {
    const response = await api.get('/files');
    return response.data;
  },

  async getTrashedFiles(): Promise<FileItem[]> {
    const response = await api.get('/files/trash');
    return response.data;
  },

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  async renameFile(id: string, filename: string): Promise<FileItem> {
    const response = await api.post(`/files/file/${id}/rename`, { filename });
    return response.data;
  },

  async shareFile(id: string): Promise<{ share_url: string }> {
    const response = await api.post(`/files/share/${id}`);
    return response.data;
  },

  async moveToTrash(id: string): Promise<void> {
    await api.post(`/files/trash/${id}`);
  },

  async restoreFile(id: string): Promise<void> {
    await api.post(`/files/trash/${id}/restore`);
  },

  async deleteFilePermanently(id: string): Promise<void> {
    await api.delete(`/files/trash/${id}/purge`);
  }
};