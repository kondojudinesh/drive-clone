import React from 'react';
import { NavLink } from 'react-router-dom';
import { HardDrive, Share, Trash2, Plus } from 'lucide-react';

interface SidebarProps {
  onCreateFolder: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCreateFolder }) => {
  const menuItems = [
    {
      icon: HardDrive,
      label: 'My Drive',
      path: '/dashboard',
      count: null,
    },
    {
      icon: Share,
      label: 'Shared with me',
      path: '/shared',
      count: null,
    },
    {
      icon: Trash2,
      label: 'Trash',
      path: '/trash',
      count: null,
    },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-4">
        {/* New Button */}
        <button
          onClick={onCreateFolder}
          className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 mb-4"
        >
          <Plus className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
          <span className="font-medium">New</span>
        </button>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
              {item.count && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Storage Info */}
        <div className="mt-8 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Storage</span>
            <span>2.5 GB of 15 GB used</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '17%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;