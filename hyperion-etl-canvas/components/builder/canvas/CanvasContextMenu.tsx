
import React, { memo } from 'react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  selectedNodeId: string;
  onGenerateAi: () => void;
  onResetView: () => void;
}

const ContextMenuItem = memo(({ icon, label, shortcut, onClick }: { icon: string, label: string, shortcut?: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full text-left px-3 py-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/30 flex items-center justify-between group"
  >
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-gray-400 group-hover:text-primary-600 text-lg">{icon}</span>
      <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-primary-700 font-medium">{label}</span>
    </div>
    {shortcut && <span className="text-xs text-gray-400">{shortcut}</span>}
  </button>
));

export const CanvasContextMenu = memo(({ x, y, selectedNodeId, onGenerateAi, onResetView }: CanvasContextMenuProps) => {
  return (
    <div 
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg py-1 z-[100] w-56 animate-in fade-in duration-100"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 mb-1 border-b border-gray-100 dark:border-gray-700">
         <button 
            onClick={onGenerateAi}
            className="w-full text-left flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
         >
             <span className="material-symbols-outlined text-sm">auto_awesome</span>
             {selectedNodeId ? 'AI: Suggest Next Step' : 'AI: Create Workflow'}
         </button>
      </div>
      <ContextMenuItem icon="add_circle" label="Add Node" />
      <ContextMenuItem icon="content_paste" label="Paste" shortcut="⌘V" />
      <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
      <ContextMenuItem icon="center_focus_weak" label="Reset View" onClick={onResetView} />
    </div>
  );
});
