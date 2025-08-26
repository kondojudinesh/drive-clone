import React, { useState, useEffect } from 'react';
import { Upload, Grid, List, SortAsc, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileItem from '../components/FileItem';
import UploadModal from '../components/UploadModal';
import Loader from '../components/Loader';
import { apiClient } from '../utils/api';

interface FileData {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  modifiedAt: string;
  isShared?: boolean;
}

const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  useEffect(() => {
    filterAndSortFiles();
  }, [files, searchQuery, sortBy]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getFiles(currentFolder || undefined);
      if (response.success && response.data) {
        setFiles(response.data);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      // Mock data for development
      setFiles([
        {
          id: '1',
          name: 'Project Proposal.pdf',
          type: 'file',
          mimeType: 'application/pdf',
          size: 2048000,
          modifiedAt: '2024-01-15T10:30:00Z',
          isShared: false,
        },
        {
          id: '2',
          name: 'Images',
          type: 'folder',
          modifiedAt: '2024-01-14T15:45:00Z',
          isShared: true,
        },
        {
          id: '3',
          name: 'Presentation.pptx',
          type: 'file',
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          size: 5120000,
          modifiedAt: '2024-01-13T09:15:00Z',
          isShared: false,
        },
        {
          id: '4',
          name: 'vacation-photo.jpg',
          type: 'file',
          mimeType: 'image/jpeg',
          size: 3072000,
          modifiedAt: '2024-01-12T14:20:00Z',
          isShared: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortFiles = () => {
    let filtered = [...files];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case 'size':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

    setFilteredFiles(filtered);
  };

  const handleUpload = async (fileList: FileList) => {
    for (let i = 0; i < fileList.length; i++) {
      try {
        await apiClient.uploadFile(fileList[i], currentFolder || undefined);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
    loadFiles();
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await apiClient.createFolder(name, currentFolder || undefined);
      loadFiles();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleFileClick = (file: FileData) => {
    if (file.type === 'folder') {
      setCurrentFolder(file.id);
    } else {
      // Handle file opening
      console.log('Opening file:', file);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await apiClient.deleteFile(fileId);
      loadFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleShare = async (fileId: string) => {
    try {
      await apiClient.shareFile(fileId, true);
      loadFiles();
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  };

  const handleDownload = async (fileId: string) => {
    // Implement download logic
    console.log('Downloading file:', fileId);
  };

  const handleRename = async (fileId: string, newName: string) => {
    // Implement rename logic
    console.log('Renaming file:', fileId, 'to', newName);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onCreateFolder={() => setShowUploadModal(true)} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                My Drive
              </h2>
              
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                  <option value="size">Sort by Size</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </button>
              </div>
            </div>

            {/* File Grid/List */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader size="lg" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Upload className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No files found' : 'No files yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Upload your first files to get started'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Upload Files
                  </button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                  : 'space-y-2'
              }>
                {filteredFiles.map(file => (
                  <FileItem
                    key={file.id}
                    file={file}
                    onDelete={handleDelete}
                    onShare={handleShare}
                    onDownload={handleDownload}
                    onRename={handleRename}
                    onClick={handleFileClick}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export default Dashboard;