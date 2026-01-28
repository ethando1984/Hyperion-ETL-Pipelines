
import React, { useState, memo, useEffect } from 'react';
import { NodeType } from '../../pages/Builder';
import { SavedFiltersModal } from '../SavedFiltersModal';
import { api, PreviewRow } from '../../api';

interface DataPreviewProps {
  nodeType: NodeType;
  onClose: () => void;
  nodeId?: string; // Passed from parent if available
}

interface FilterRowProps {
    field: string;
    condition: string;
    value: string;
}

export const DataPreview: React.FC<DataPreviewProps> = memo(({ nodeType, onClose, nodeId = "mock-id" }) => {
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isSavedFiltersOpen, setIsSavedFiltersOpen] = useState(false);
  const [data, setData] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.builder.getDataPreview(nodeId, nodeType).then((rows) => {
        setData(rows);
        setLoading(false);
    });
  }, [nodeType, nodeId]);

  return (
    <div className="h-80 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col z-30 shadow-2xl absolute bottom-0 w-full transition-all duration-300">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600 text-lg font-semibold">visibility</span>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Preview: {nodeType.toUpperCase()} Node</h3>
            <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">First 10 rows</span>
          </div>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              type="text" 
              className="pl-8 pr-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[11px] w-48 focus:ring-1 focus:ring-primary-600 focus:border-primary-600 placeholder-gray-400" 
              placeholder="Search data..." 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button 
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-[11px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm mr-1.5 text-primary-600">filter_list</span>
              Filter Data
            </button>
            
            {/* Filter Popover */}
            {isFilterPopoverOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-[480px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[60] p-4">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">Advanced Filter</h4>
                  <button onClick={() => setIsFilterPopoverOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                   <FilterRow field="amount" condition="greater than" value="1000" />
                   <button className="flex items-center text-[11px] font-semibold text-primary-600 hover:text-primary-700">
                      <span className="material-symbols-outlined text-sm mr-1">add</span> Add Condition
                   </button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                   <button className="text-[11px] font-medium text-gray-500 hover:text-gray-700" onClick={() => setIsFilterPopoverOpen(false)}>Clear All</button>
                   <div className="flex gap-2">
                     <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-[11px] font-medium" onClick={() => setIsSavedFiltersOpen(true)}>Save Filter</button>
                     <button className="px-3 py-1 bg-primary-600 text-white rounded text-[11px] font-bold shadow-sm">Apply Filter</button>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
          <button className="text-gray-400 hover:text-primary-600 transition-colors">
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-1.5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center flex-wrap gap-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Active Filters:</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full">
          <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">amount &gt; 1000</span>
          <button className="flex items-center text-blue-400 hover:text-blue-600"><span className="material-symbols-outlined text-[14px]">close</span></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
            <div className="flex items-center justify-center h-full">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600"></div>
            </div>
        ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
                <tr>
                {data.length > 0 && Object.keys(data[0]).map((header) => (
                    <th key={header} className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
                        <span className={header === 'amount' ? 'text-primary-600' : ''}>{header}</span>
                        <span className={`material-symbols-outlined text-xs ${header === 'amount' ? 'text-primary-600' : 'text-gray-300 group-hover:text-primary-600'}`}>filter_alt</span>
                    </div>
                    </th>
                ))}
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                        {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="px-4 py-2 text-xs text-gray-900 dark:text-white border-r border-gray-50 dark:border-gray-700 font-medium">
                                {val}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>

      {isSavedFiltersOpen && <SavedFiltersModal onClose={() => setIsSavedFiltersOpen(false)} />}
    </div>
  );
});

const FilterRow = memo(({ field, condition, value }: FilterRowProps) => (
  <div className="flex items-center gap-2">
    <div className="w-1/3">
      <select className="w-full bg-white text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1 px-2 focus:ring-primary-600" defaultValue={field}>
        <option value="amount">amount</option>
        <option value="email">email</option>
      </select>
    </div>
    <div className="w-1/3">
      <select className="w-full bg-white text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1 px-2 focus:ring-primary-600" defaultValue={condition}>
        <option value="greater than">greater than</option>
        <option value="equals">equals</option>
      </select>
    </div>
    <div className="flex-1">
      <input type="text" className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded py-1 px-2 focus:ring-primary-600" defaultValue={value} />
    </div>
    <button className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
  </div>
));
