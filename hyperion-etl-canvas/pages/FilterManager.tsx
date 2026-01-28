import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import { SavedFiltersModal } from '../components/SavedFiltersModal';

const FilterManager: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <TopNav 
        breadcrumbs={[
          { label: 'ETL Management', href: '/dashboard' },
          { label: 'Filter Manager' }
        ]}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Filters Library</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage persistent data filters used across pipelines.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative w-full sm:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input type="text" className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 transition-all shadow-sm" placeholder="Search filters..." />
            </div>
            <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-all">
              <span className="material-symbols-outlined mr-2 text-lg">add</span> New Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filter Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applied To Node</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <FilterRow 
                  name="High Value Transactions" 
                  node="Join Sales & Users" 
                  author="Nguyen Van A" 
                  date="24/10/2023" 
                  onShare={() => setIsShareModalOpen(true)}
                />
                <FilterRow 
                  name="New Customers (Oct)" 
                  node="PostgreSQL PROD" 
                  author="Tran Thi B" 
                  date="15/10/2023" 
                  icon="storage"
                  nodeBg="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  onShare={() => setIsShareModalOpen(true)}
                />
                <FilterRow 
                  name="Email Data Errors" 
                  node="Join Sales & Users" 
                  author="Le Duc D" 
                  date="10/10/2023" 
                  onShare={() => setIsShareModalOpen(true)}
                />
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
             <div className="text-xs text-gray-500 dark:text-gray-400">Showing <span className="font-bold text-gray-900 dark:text-white">1 - 3</span> of <span className="font-bold text-gray-900 dark:text-white">12</span> filters</div>
             <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1 border border-primary-600 bg-primary-600 rounded text-xs font-bold text-white shadow-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-500 bg-white hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-500 bg-white hover:bg-gray-50">Next</button>
             </div>
          </div>
        </div>
      </main>

      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
};

const FilterRow = ({ name, node, author, date, icon="join_inner", nodeBg="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", onShare }: any) => (
  <tr className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <span className="material-symbols-outlined text-primary-600 mr-3 text-lg opacity-60">bookmark</span>
        <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-opacity-50 ${nodeBg}`}>
        <span className="material-symbols-outlined text-sm">{icon}</span>
        <span className="text-xs font-medium">{node}</span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-700 border border-gray-200">
            {author.split(' ').map((n:string) => n[0]).join('').substring(0,2)}
        </div>
        <span className="text-gray-600 dark:text-gray-300">{author}</span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 italic">{date}</td>
    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-blue-50 rounded-md transition-all" title="Apply">
          <span className="material-symbols-outlined text-xl">play_circle</span>
        </button>
        <button onClick={onShare} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-blue-50 rounded-md transition-all" title="Share">
          <span className="material-symbols-outlined text-xl">share</span>
        </button>
        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all" title="Delete">
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </div>
    </td>
  </tr>
);

const ShareModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">share</span>
            Share Filter
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5 flex flex-col gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Invite People</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">person_search</span>
              <input type="text" className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 transition-all shadow-sm" placeholder="Search name or email" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Access List</label>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
               <UserAccessRow name="Nguyen Van A" email="vana.nguyen@company.com" role="Owner" />
               <UserAccessRow name="Tran Thi B" email="thib.tran@company.com" role="Editor" />
               <UserAccessRow name="Le Duc D" email="ducle@company.com" role="Viewer" />
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-600 transition-colors">
            <span className="material-symbols-outlined text-lg">link</span> Copy Link
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
            <button className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 shadow-sm transition-all">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
);

const UserAccessRow = ({ name, email, role }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
        {name.split(' ').map((n:string) => n[0]).join('').substring(0,2)}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{name}</p>
        <p className="text-xs text-gray-500 mt-1">{email}</p>
      </div>
    </div>
    {role === 'Owner' ? (
        <span className="text-xs font-medium text-gray-400 italic">Owner</span>
    ) : (
        <select className="bg-transparent border-none text-xs font-medium text-gray-600 focus:ring-0 cursor-pointer p-1 rounded hover:bg-gray-100" defaultValue={role === 'Editor' ? 'edit' : 'view'}>
            <option value="view">Can view</option>
            <option value="edit">Can edit</option>
        </select>
    )}
  </div>
);

export default FilterManager;