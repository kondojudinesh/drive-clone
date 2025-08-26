import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileItem from '../components/FileItem';
import Loader from '../components/Loader';
import { apiClient } from '../utils/api';

interface TrashFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  modifiedAt: string;
  deletedAt: string;
  isShared?: boolean;
}

const Trash: React.FC = () => {
  const [files, setFiles] = useState<TrashFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<TrashFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    loadTrashFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, searchQuery]);

  const loadTrashFiles = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getTrashFiles();
      if (response.success && response.data) {
        setFiles(response.data);
      }
    } catch (error) {
      console.error('Failed to load trash files:', error);
      // Mock data for development
      setFiles([
        {
          id: 't1',
          name: 'Old Document.pdf',
          type: 'file',
          mimeType: 'application/pdf',
          size: 1024000,
          modifiedAt: '2024-01-10T10:30:00Z',
          deletedAt: '2024-01-15T14:20:00Z',
          isShared: false,
        },
        {
          id: 't2',
          name: 'Archive Folder',
          type: 'folder',
          modifiedAt: '2024-01-05T15:45:00Z',
          deletedAt: '2024-01-14T11:30:00Z',
          isShared: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFiles = () => {
    let filtered = [...files];

    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by deletion date (most recently deleted first)
    filtered.sort((a, b) => 
      new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );

    setFilteredFiles(filtered);
  };

  const handleRestore = async (fileId: string) => {
    try {
      await apiClient.restoreFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Failed to restore file:', error);
    }
  };

  const handlePermanentDelete = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.permanentDeleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Failed to permanently delete file:', error);
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all files in trash? This action cannot be undone.')) {
      return;
    }

    try {
      for (const file of files) {
        await apiClient.permanentDeleteFile(file.id);
      }
      setFiles([]);
    } catch (error) {
      console.error('Failed to empty trash:', error);
    }
  };

  const handleFileClick = (file: TrashFile) => {
    // Preview or info about trashed file
    console.log('Viewing trash file:', file);
  };

  const TrashFileItem: React.FC<{ file: TrashFile }> = ({ file }) => {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {file.type === 'folder' ? (
                <Trash2 className="w-5 h-5 text-gray-500" />
              ) : (
                <Trash2 className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Deleted {new Date(file.deletedAt).toLocaleDateString()}
                </p>
                {file.size && (
                  <>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRestore(file.id)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePermanentDelete(file.id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete forever"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onCreateFolder={() => {}} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Trash
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Items in trash are deleted forever after 30 days
                </p>
              </div>
              
              {files.length > 0 && (
                <button
                  onClick={handleEmptyTrash}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-600 dark:border-red-400 rounded-lg transition-colors duration-200"
                >
                  Empty trash
                </button>
              )}
            </div>

            {/* File List */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader size="lg" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Trash2 className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No files found in trash' : 'Trash is empty'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Items you delete will appear here before being permanently deleted'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFiles.map(file => (
                  <TrashFileItem key={file.id} file={file} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Trash;