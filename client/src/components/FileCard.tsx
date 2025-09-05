import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  File, 
  MoreVertical, 
  Edit, 
  Share, 
  Trash2,
  RotateCcw,
  X
} from 'lucide-react';
import { FileItem } from '../services/files';

interface FileCardProps {
  file: FileItem;
  onRename?: (id: string, filename: string) => void;
  onShare?: (id: string) => void;
  onTrash?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  isTrashed?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onRename,
  onShare,
  onTrash,
  onRestore,
  onDelete,
  isTrashed = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.filename);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRename = () => {
    if (onRename && newName.trim() && newName !== file.filename) {
      onRename(file.id, newName.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(file.filename);
      setIsRenaming(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 relative"
    >
      {/* Menu dropdown */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-4 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[120px]">
            {!isTrashed && (
              <>
                <button
                  onClick={() => setIsRenaming(true)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => onShare?.(file.id)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => onTrash?.(file.id)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Move to trash</span>
                </button>
              </>
            )}
            {isTrashed && (
              <>
                <button
                  onClick={() => onRestore?.(file.id)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => onDelete?.(file.id)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Delete forever</span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      <div className="flex items-start justify-between mb-3">
        <File className="w-8 h-8 text-indigo-500" />
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyPress}
            className="w-full text-sm font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            autoFocus
          />
        ) : (
          <h3 className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
            {file.filename}
          </h3>
        )}
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.created_at)}</span>
        </div>
      </div>
    </motion.div>
  );
};