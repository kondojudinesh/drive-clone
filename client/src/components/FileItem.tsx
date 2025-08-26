import React, { useState, useRef, useEffect } from 'react';
import { 
  File, 
  Folder, 
  Image, 
  Video, 
  Music, 
  FileText,
  MoreVertical,
  Download,
  Share,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';

interface FileItemProps {
  file: {
    id: string;
    name: string;
    type: 'file' | 'folder';
    mimeType?: string;
    size?: number;
    modifiedAt: string;
    isShared?: boolean;
  };
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  onDownload: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onClick: (file: any) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onDelete,
  onShare,
  onDownload,
  onRename,
  onClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const getFileIcon = () => {
    if (file.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }

    if (file.mimeType?.startsWith('image/')) {
      return <Image className="w-8 h-8 text-green-500" />;
    }
    if (file.mimeType?.startsWith('video/')) {
      return <Video className="w-8 h-8 text-red-500" />;
    }
    if (file.mimeType?.startsWith('audio/')) {
      return <Music className="w-8 h-8 text-purple-500" />;
    }
    if (file.mimeType?.includes('text') || file.mimeType?.includes('document')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }

    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(file.id, newName.trim());
    }
    setIsRenaming(false);
    setNewName(file.name);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(file.name);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start justify-between">
        <div 
          className="flex items-center space-x-3 flex-1 cursor-pointer"
          onClick={() => onClick(file)}
        >
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyPress={handleKeyPress}
                className="w-full px-2 py-1 text-sm font-medium bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </h3>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(file.modifiedAt)}
              </p>
              {file.size && (
                <>
                  <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </>
              )}
              {file.isShared && (
                <>
                  <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-xs text-blue-500 dark:text-blue-400">Shared</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-10">
              {file.type === 'file' && (
                <button
                  onClick={() => {
                    onDownload(file.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-3" />
                  Download
                </button>
              )}
              
              <button
                onClick={() => {
                  onShare(file.id);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share className="w-4 h-4 mr-3" />
                Share
              </button>
              
              <button
                onClick={() => {
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="w-4 h-4 mr-3" />
                Rename
              </button>
              
              <button
                onClick={() => {
                  // Copy link functionality
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Copy className="w-4 h-4 mr-3" />
                Copy link
              </button>
              
              <hr className="my-2 border-gray-200 dark:border-gray-600" />
              
              <button
                onClick={() => {
                  onDelete(file.id);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Move to trash
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileItem;