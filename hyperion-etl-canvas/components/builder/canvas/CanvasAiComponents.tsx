
import React, { memo } from 'react';
import { AISuggestion, AIInsight, NodeData } from './types';

// --- AI Suggestions ---

interface AiSuggestionsProps {
  suggestions: AISuggestion[];
  selectedNode: NodeData | undefined;
  onApply: (suggestion: AISuggestion) => void;
  onHover: (id: string | null) => void;
}

export const AiSuggestionsList = memo(({ suggestions, selectedNode, onApply, onHover }: AiSuggestionsProps) => {
  if (!selectedNode || suggestions.length === 0) return null;

  const leftPos = selectedNode.x + 280; 
  const topPos = selectedNode.y;

  return (
    <div 
       className="absolute z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-left-4 duration-300"
       style={{ 
           left: leftPos, 
           top: topPos,
           width: '280px'
       }}
    >
        <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary-500 text-lg animate-pulse">auto_awesome</span>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">AI Suggestions</span>
        </div>
        
        {suggestions.map(sugg => (
            <div 
              key={sugg.id}
              onMouseEnter={() => onHover(sugg.id)}
              onMouseLeave={() => onHover(null)}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-primary-200 dark:border-primary-900 shadow-xl rounded-xl p-3 cursor-pointer hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition-all group"
            >
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm text-gray-500">{sugg.nodeData.icon}</span>
                       {sugg.title}
                    </h4>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">{sugg.confidence}%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{sugg.description}</p>
                
                {sugg.reason && (
                    <div className="flex items-center gap-1 text-[10px] text-primary-600 dark:text-primary-400 mb-3 bg-primary-50 dark:bg-primary-900/20 p-1 rounded">
                        <span className="material-symbols-outlined text-[12px]">lightbulb</span>
                        {sugg.reason}
                    </div>
                )}

                <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => onApply(sugg)}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> Add Node
                    </button>
                </div>
            </div>
        ))}
    </div>
  );
});

// --- AI Insight Banner ---

interface AiInsightBannerProps {
  insight: AIInsight;
  onDismiss: () => void;
}

export const AiInsightBanner = memo(({ insight, onDismiss }: AiInsightBannerProps) => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border-l-4 border-indigo-500 shadow-lg rounded-r-lg p-3 flex items-start gap-3 max-w-lg z-50 animate-in slide-in-from-top-4 duration-500">
      <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600">
          <span className="material-symbols-outlined">analytics</span>
      </div>
      <div className="flex-1">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-0.5">AI Optimization Insight</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{insight.message}</p>
      </div>
      <div className="flex flex-col gap-1">
          <button 
            onClick={insight.onAction}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow-sm transition-colors whitespace-nowrap"
          >
              {insight.actionLabel}
          </button>
          <button 
            onClick={onDismiss}
            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
              Dismiss
          </button>
      </div>
  </div>
));

// --- AI Command Bar ---

interface AiCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export const AiCommandBar = memo(({ isOpen, onClose, onSubmit }: AiCommandBarProps) => {
  const [text, setText] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] z-[60]">
       <form onSubmit={handleSubmit} className="relative shadow-2xl rounded-xl overflow-hidden ring-4 ring-primary-500/20">
           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">auto_awesome</span>
           </div>
           <input 
              type="text" 
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe a workflow... (e.g., 'Load users from MySQL, filter by date, save to BigQuery')"
              className="block w-full pl-11 pr-20 py-4 bg-white dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 text-base shadow-sm"
           />
           <div className="absolute inset-y-0 right-0 flex items-center pr-2">
               <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 mr-1">
                   <span className="material-symbols-outlined text-sm">close</span>
               </button>
               <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
                   Generate <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
               </button>
           </div>
       </form>
       <div className="mt-2 text-center">
           <span className="inline-block bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">
               ✨ AI Mode Active
           </span>
       </div>
    </div>
  );
});
