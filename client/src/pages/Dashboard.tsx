import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, Grid, List } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { FileCard } from '../components/FileCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { fileService, FileItem } from '../services/files';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await fileService.getFiles();
      setFiles(data.filter(file => !file.is_deleted));
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: string, filename: string) => {
    try {
      await fileService.renameFile(id, filename);
      setFiles(files.map(file => 
        file.id === id ? { ...file, filename } : file
      ));
      toast.success('File renamed successfully');
    } catch (error) {
      toast.error('Failed to rename file');
    }
  };

  const handleShare = async (id: string) => {
    try {
      const response = await fileService.shareFile(id);
      navigator.clipboard.writeText(response.share_url);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to share file');
    }
  };

  const handleTrash = async (id: string) => {
    try {
      await fileService.moveToTrash(id);
      setFiles(files.filter(file => file.id !== id));
      toast.success('File moved to trash');
    } catch (error) {
      toast.error('Failed to move file to trash');
    }
  };

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:ml-64">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Files</h1>
              <Link
                to="/upload"
                className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 w-fit"
              >
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
              </Link>
            </div>

            {/* Search and View Controls */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Files Grid/List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16">
              <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No files found' : 'No files yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Upload your first file to get started'
                }
              </p>
              {!searchTerm && (
                <Link
                  to="/upload"
                  className="inline-flex items-center space-x-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }`}
            >
              <AnimatePresence>
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onRename={handleRename}
                    onShare={handleShare}
                    onTrash={handleTrash}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
