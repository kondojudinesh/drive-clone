import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, File, X, CheckCircle } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { fileService } from '../services/files';
import toast from 'react-hot-toast';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export const Upload: React.FC = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const newUploadFiles = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    try {
      setUploadFiles(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, status: 'uploading' } : item
        )
      );

      await fileService.uploadFile(uploadFile.file, (progress) => {
        setUploadFiles(prev =>
          prev.map((item, i) =>
            i === index ? { ...item, progress } : item
          )
        );
      });

      setUploadFiles(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, status: 'success', progress: 100 } : item
        )
      );

      toast.success(`${uploadFile.file.name} uploaded successfully`);
    } catch (error) {
      setUploadFiles(prev =>
        prev.map((item, i) =>
          i === index ? { ...item, status: 'error' } : item
        )
      );
      toast.error(`Failed to upload ${uploadFile.file.name}`);
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.status === 'pending');

    for (const { item, index } of pendingFiles) {
      await uploadFile(item, index);
    }

    // Check if all files were uploaded successfully
    const allSuccessful = uploadFiles.every(item => item.status === 'success');
    if (allSuccessful && uploadFiles.length > 0) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <LoadingSpinner size="small" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Upload Files</h1>
            <p className="mt-2 text-gray-600">
              Drag and drop files here or click to browse
            </p>
          </div>

          {/* Upload Area */}
          <motion.div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 bg-white hover:border-indigo-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here to upload
            </h3>
            <p className="text-gray-500 mb-4">
              or click the button below to select files
            </p>
            <label className="inline-block bg-indigo-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-indigo-600 transition-colors duration-200">
              <span>Select Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </motion.div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Files to Upload ({uploadFiles.length})
                  </h3>
                  <button
                    onClick={uploadAllFiles}
                    disabled={uploadFiles.some(f => f.status === 'uploading')}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Upload All
                  </button>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {uploadFiles.map((uploadFile, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {getStatusIcon(uploadFile.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadFile.file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(uploadFile.file.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {uploadFile.status === 'uploading' && (
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                        )}
                        
                        {uploadFile.status === 'pending' && (
                          <button
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}

                        {uploadFile.status === 'success' && (
                          <span className="text-sm text-green-600 font-medium">
                            Completed
                          </span>
                        )}

                        {uploadFile.status === 'error' && (
                          <span className="text-sm text-red-600 font-medium">
                            Failed
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};