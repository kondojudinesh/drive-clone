import api from './api';

export interface FileItem {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;  // ✅ match backend schema
  trashed_at?: string;
}

export const fileService = {
  async getFiles(): Promise<FileItem[]> {
    const response = await api.get('/files');
    return response.data.files;  // ✅ unwrap files array
  },

  async getTrashedFiles(): Promise<FileItem[]> {
    const response = await api.get('/files/trash');
    return response.data.files;  // ✅ unwrap files array
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

    return response.data;  // backend returns { message: "..."} but you might want file info later
  },

  async renameFile(id: string, name: string): Promise<{ message: string }> {
    const response = await api.post(`/files/file/${id}/rename`, { name });
    return response.data;
  },

  async shareFile(id: string): Promise<{ share_link: string }> {
    const response = await api.post(`/files/share/${id}`);
    return response.data;
  },

  async moveToTrash(id: string): Promise<{ message: string }> {
    const response = await api.post(`/files/trash/${id}`);
    return response.data;
  },

  async restoreFile(id: string): Promise<{ message: string }> {
    const response = await api.post(`/files/trash/${id}/restore`);
    return response.data;
  },

  async deleteFilePermanently(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/files/trash/${id}/purge`);
    return response.data;
  }
};
