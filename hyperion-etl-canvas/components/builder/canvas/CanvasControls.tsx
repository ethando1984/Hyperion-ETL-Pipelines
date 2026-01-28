
import React, { memo } from 'react';
import { ViewState } from './types';

interface CanvasControlsProps {
  view: ViewState;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
  snapToGrid: boolean;
  setSnapToGrid: React.Dispatch<React.SetStateAction<boolean>>;
  isCommandBarOpen: boolean;
  setIsCommandBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CanvasButton = memo(({ icon, onClick, title, active }: { icon: string, onClick?: () => void, title?: string, active?: boolean }) => (
  <button 
    onClick={onClick}
    title={title}
    className={`p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:bg-gray-100 ${active ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-600 dark:text-gray-300'}`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
  </button>
));

export const CanvasControls = memo(({ 
  view, 
  setView, 
  snapToGrid, 
  setSnapToGrid, 
  isCommandBarOpen, 
  setIsCommandBarOpen 
}: CanvasControlsProps) => {
  return (
    <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-50">
      <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden group">
          <button 
              onClick={() => setIsCommandBarOpen(!isCommandBarOpen)}
              className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:brightness-110 transition-all active:scale-95"
              title="AI Command Bar (Cmd+K)"
          >
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </button>
      </div>

      <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
        <CanvasButton 
          icon="add" 
          onClick={() => setView(v => ({ ...v, zoom: Math.min(v.zoom + 0.1, 3) }))} 
          title="Zoom In"
        />
        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
        <CanvasButton 
          icon="remove" 
          onClick={() => setView(v => ({ ...v, zoom: Math.max(v.zoom - 0.1, 0.2) }))} 
          title="Zoom Out"
        />
        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
        <CanvasButton 
          icon="center_focus_strong" 
          onClick={() => setView({ x: 0, y: 0, zoom: 1 })} 
          title="Fit to View"
        />
      </div>

      <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
        <CanvasButton 
          icon={snapToGrid ? "grid_on" : "grid_off"}
          onClick={() => setSnapToGrid(!snapToGrid)} 
          title={snapToGrid ? "Disable Snap to Grid" : "Enable Snap to Grid"}
          active={snapToGrid}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-[10px] font-mono text-gray-500 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
        {Math.round(view.zoom * 100)}%
      </div>
    </div>
  );
});
