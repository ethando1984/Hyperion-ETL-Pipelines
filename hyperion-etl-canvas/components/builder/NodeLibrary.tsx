
import React, { memo, useEffect, useState } from 'react';
import { api } from '../../api';

interface LibraryItem {
  name: string;
  icon: string;
  color: string;
}

interface LibrarySectionProps {
  title: string;
  icon: string;
  items: LibraryItem[];
}

export const NodeLibrary: React.FC = memo(() => {
  const [items, setItems] = useState<{sources: LibraryItem[], transforms: LibraryItem[], destinations: LibraryItem[]} | null>(null);

  useEffect(() => {
    api.builder.getLibraryNodes().then(setItems);
  }, []);

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto z-10">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Node Library</h2>
        <div className="mt-2 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
          </div>
          <input 
            type="text" 
            className="bg-white focus:ring-primary-500 focus:border-primary-500 block w-full pl-8 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-1.5" 
            placeholder="Search nodes..." 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {items ? (
          <>
            <LibrarySection title="Data Sources" icon="input" items={items.sources} />
            <LibrarySection title="Transform" icon="transform" items={items.transforms} />
            <LibrarySection title="Destinations" icon="output" items={items.destinations} />
          </>
        ) : (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        )}
      </div>
    </aside>
  );
});

const LibrarySection = memo(({ title, icon, items }: LibrarySectionProps) => (
  <div>
    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1">
      <span className="material-symbols-outlined text-sm">{icon}</span> {title}
    </h3>
    <div className="grid grid-cols-1 gap-2">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded flex items-center gap-3 cursor-grab hover:border-primary-500 hover:shadow-sm transition-all group">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${item.color}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600">{item.name}</span>
        </div>
      ))}
    </div>
  </div>
));
