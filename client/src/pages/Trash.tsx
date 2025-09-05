import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { FileCard } from '../components/FileCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { fileService, FileItem } from '../services/files';
import toast from 'react-hot-toast';

export const Trash: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrashedFiles();
  }, []);

  const loadTrashedFiles = async () => {
    try {
      const data = await fileService.getTrashedFiles();
      setFiles(data.filter(file => file.is_deleted));
    } catch (error) {
      toast.error('Failed to load trashed files');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await fileService.restoreFile(id);
      setFiles(files.filter(file => file.id !== id));
      toast.success('File restored successfully');
    } catch (error) {
      toast.error('Failed to restore file');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      await fileService.deleteFilePermanently(id);
      setFiles(files.filter(file => file.id !== id));
      toast.success('File deleted permanently');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all files in trash? This action cannot be undone.')) {
      return;
    }

    try {
      await Promise.all(files.map(file => fileService.deleteFilePermanently(file.id)));
      setFiles([]);
      toast.success('Trash emptied successfully');
    } catch (error) {
      toast.error('Failed to empty trash');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:ml-64">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Trash</h1>
                <p className="mt-1 text-gray-600">
                  Files in trash will be automatically deleted after 30 days
                </p>
              </div>
              {files.length > 0 && (
                <button
                  onClick={handleEmptyTrash}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 w-fit"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Empty Trash</span>
                </button>
              )}
            </div>
          </div>

          {/* Files Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="large" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Trash is empty
              </h3>
              <p className="text-gray-500">
                Files you delete will appear here
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                    isTrashed
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {files.length > 0 && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <RotateCcw className="w-5 h-5 text-yellow-600 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Restore files before they're gone forever
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Files in trash are automatically deleted after 30 days. 
                    You can restore them to your files or delete them permanently.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
