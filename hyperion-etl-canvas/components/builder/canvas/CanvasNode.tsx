
import React, { memo } from 'react';
import { NodeData } from './types';

interface CanvasNodeProps {
  node: NodeData;
  isDragging: boolean;
  isSelected: boolean;
  isPanning: boolean;
  onMouseDown: (e: React.MouseEvent, node: NodeData) => void;
  measureRef: (node: HTMLDivElement | null) => void;
  onSuggestion: (e: React.MouseEvent, nodeId: string) => void;
}

export const CanvasNode = memo(({ 
  node, 
  isDragging, 
  isSelected, 
  isPanning,
  onMouseDown, 
  measureRef, 
  onSuggestion 
}: CanvasNodeProps) => {
  return (
    <div
      data-node-id={node.id}
      ref={measureRef}
      onMouseDown={(e) => onMouseDown(e, node)}
      className={`absolute w-60 bg-white dark:bg-gray-800 rounded-xl transition-shadow duration-200 group border
        ${isDragging 
          ? 'shadow-2xl border-primary-500 ring-2 ring-primary-500/40 z-50' 
          : 'shadow-md border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 z-10'
        }
        ${!isDragging && isSelected 
          ? 'border-primary-500 ring-2 ring-primary-500/20 z-20' 
          : ''
        }
        ${node.status === 'error' ? '!border-red-500' : ''}
        ${node.status === 'warning' ? '!border-orange-400' : ''}
      `}
      style={{
        transform: `translate(${node.x}px, ${node.y}px) scale(${isDragging ? 1.05 : 1})`,
        cursor: isPanning ? 'grabbing' : (isDragging ? 'grabbing' : 'grab'),
        zIndex: isDragging ? 50 : (isSelected ? 20 : 10)
      }}
    >
      {node.isAiGenerated && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-30 whitespace-nowrap">
              <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
              {node.aiLabel || 'AI Generated'}
          </div>
      )}

      {/* Input Port */}
      <div className="absolute top-1/2 -left-3 w-3 h-3 -mt-1.5 bg-white dark:bg-gray-700 border-2 border-gray-400 hover:border-primary-500 hover:scale-125 transition-all rounded-full z-30 cursor-crosshair"></div>
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800 rounded-t-xl">
         <div className="flex items-center gap-3">
           <div className={`p-1.5 rounded-md ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-transparent'}`}>
              <span className={`material-symbols-outlined text-lg ${node.iconColor}`}>{node.icon}</span>
           </div>
           <div className="overflow-hidden">
             <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{node.title}</h3>
           </div>
         </div>
         {isSelected && (
             <button 
               onClick={(e) => onSuggestion(e, node.id)}
               className="text-primary-500 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 p-1 rounded transition-colors"
               title="AI Suggestions"
             >
                 <span className="material-symbols-outlined text-sm">auto_awesome</span>
             </button>
         )}
      </div>

      {/* Body */}
      <div className="p-4">
        {node.subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
             <span className="material-symbols-outlined text-[14px]">info</span> {node.subtitle}
          </div>
        )}
        {node.config}
        {node.status === 'warning' && !node.isAiGenerated && (
          <button className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1.5 rounded border border-orange-200 transition-colors group">
            <span className="material-symbols-outlined text-[12px] group-hover:animate-spin">build</span>
            Auto-fix with AI
          </button>
        )}
      </div>

      {/* Output Port */}
      <div className="absolute top-1/2 -right-3 w-3 h-3 -mt-1.5 bg-white dark:bg-gray-700 border-2 border-gray-400 hover:border-primary-500 hover:scale-125 transition-all rounded-full z-30 cursor-crosshair"></div>
      
      {/* Status Indicator */}
      {node.status === 'ok' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
          <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.node.x === nextProps.node.x &&
    prevProps.node.y === nextProps.node.y &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isPanning === nextProps.isPanning &&
    prevProps.node.status === nextProps.node.status &&
    prevProps.node.id === nextProps.node.id
  );
});
