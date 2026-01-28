
import React from 'react';
import { Modal } from './common/Modal';

export const SavedFiltersModal = ({ onClose }: { onClose: () => void }) => {
  const footer = (
    <>
      <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
      <button onClick={onClose} className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 shadow-sm transition-all">Save</button>
    </>
  );

  return (
    <Modal title="Save Filter" onClose={onClose} footer={footer} maxWidth="max-w-sm">
       <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Filter Name</label>
            <input type="text" className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 transition-all shadow-sm" placeholder="e.g. High Value Orders" />
          </div>
          <p className="text-xs text-gray-500">This filter will be saved to your library and can be reused in other pipelines.</p>
        </div>
    </Modal>
  );
};
