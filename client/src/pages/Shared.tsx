import React, { useState, useEffect } from 'react';
import { Share } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileItem from '../components/FileItem';
import Loader from '../components/Loader';

interface FileData {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  modifiedAt: string;
  isShared?: boolean;
  sharedBy?: string;
}

const Shared: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSharedFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, searchQuery]);

  const loadSharedFiles = async () => {
    setIsLoading(true);
    try {
      // Mock data for shared files
      setTimeout(() => {
        setFiles([
          {
            id: 's1',
            name: 'Team Presentation.pptx',
            type: 'file',
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            size: 4096000,
            modifiedAt: '2024-01-14T11:30:00Z',
            isShared: true,
            sharedBy: 'john.doe@example.com',
          },
          {
            id: 's2',
            name: 'Design Assets',
            type: 'folder',
            modifiedAt: '2024-01-13T16:45:00Z',
            isShared: true,
            sharedBy: 'jane.smith@example.com',
          },
          {
            id: 's3',
            name: 'Meeting Notes.docx',
            type: 'file',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            size: 512000,
            modifiedAt: '2024-01-12T09:15:00Z',
            isShared: true,
            sharedBy: 'team@example.com',
          },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load shared files:', error);
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

    setFilteredFiles(filtered);
  };

  const handleFileClick = (file: FileData) => {
    console.log('Opening shared file:', file);
  };

  const handleDelete = async (fileId: string) => {
    // Remove from shared files (doesn't delete the original)
    console.log('Removing shared file:', fileId);
  };

  const handleShare = async (fileId: string) => {
    console.log('Sharing file:', fileId);
  };

  const handleDownload = async (fileId: string) => {
    console.log('Downloading shared file:', fileId);
  };

  const handleRename = async (fileId: string, newName: string) => {
    // Only allow renaming if user has edit permissions
    console.log('Renaming shared file:', fileId, 'to', newName);
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
                  Shared with me
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Files and folders that others have shared with you
                </p>
              </div>
            </div>

            {/* File Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader size="lg" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Share className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No shared files found' : 'No shared files yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Files that others share with you will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map(file => (
                  <div key={file.id} className="relative">
                    <FileItem
                      file={file}
                      onDelete={handleDelete}
                      onShare={handleShare}
                      onDownload={handleDownload}
                      onRename={handleRename}
                      onClick={handleFileClick}
                    />
                    {file.sharedBy && (
                      <div className="absolute top-2 left-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                        Shared by {file.sharedBy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shared;