
import React, { memo, useEffect, useState } from 'react';
import { NodeType } from '../../pages/Builder';
import { api, DatabaseSchema } from '../../api';

interface ConfigPanelProps {
  nodeId: string;
  nodeType: NodeType;
  onClose: () => void;
}

interface JoinTypeButtonProps {
    icon: string;
    label: string;
    active?: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = memo(({ nodeId, nodeType, onClose }) => {
  const [schema, setSchema] = useState<DatabaseSchema[]>([]);

  useEffect(() => {
    // Simulate fetching schema relevant to this node context
    api.builder.getSchema('mysql').then(setSchema);
  }, [nodeId]);

  if (!nodeId) return null;

  return (
    <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto shadow-xl z-20">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Node Configuration</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {nodeId}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex-1 p-5 space-y-6">
        {nodeType === 'join' && <JoinConfig schema={schema} />}
        {nodeType === 'filter' && <FilterConfig />}
        {nodeType === 'source' && <div className="text-sm text-gray-500">Source configuration loaded from metadata.</div>}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          Apply Changes
        </button>
      </div>
    </aside>
  );
});

const JoinConfig = ({ schema }: { schema: DatabaseSchema[] }) => (
  <>
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Node Name</label>
        <input className="w-full bg-white text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm" type="text" defaultValue="Join Sales & Users" />
      </div>
    </div>
    <div className="border-t border-gray-100 dark:border-gray-700 pt-4"></div>
    <div>
      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-3">Join Config</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Left Stream</label>
          <select className="w-full bg-white text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-1.5">
            <option>Sales (MySQL)</option>
            {schema.map(t => <option key={t.tableName}>{t.tableName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Right Stream</label>
          <select className="w-full bg-white text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-1.5">
            <option>Users (Postgres)</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Join Type</label>
        <div className="flex gap-2">
          <JoinTypeButton icon="join_inner" label="Inner" active />
          <JoinTypeButton icon="join_left" label="Left" />
          <JoinTypeButton icon="join_right" label="Right" />
          <JoinTypeButton icon="join_full" label="Full" />
        </div>
      </div>
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Join Condition</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <div className="flex-1 text-xs border rounded p-1.5 bg-gray-50 dark:bg-gray-700">user_id</div>
             <span className="font-mono text-gray-400">=</span>
             <div className="flex-1 text-xs border rounded p-1.5 bg-gray-50 dark:bg-gray-700">id</div>
          </div>
        </div>
      </div>
    </div>
    <SchemaTable schema={schema} />
  </>
);

const FilterConfig = () => (
  <>
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Node Name</label>
        <input className="w-full bg-white text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm" type="text" defaultValue="Active Users Filter" />
      </div>
    </div>
    <div className="border-t border-gray-100 dark:border-gray-700 pt-4"></div>
    <div>
      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-3">Logic</h3>
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
        <select className="w-full bg-white text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
          <option>SQL Expression</option>
          <option>Visual Builder</option>
        </select>
      </div>
      <div className="mb-2 flex justify-between items-end">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">SQL (WHERE)</label>
        <span className="text-[10px] text-primary-600 cursor-pointer hover:underline">Validate</span>
      </div>
      <div className="w-full h-32 bg-slate-850 rounded-md border border-gray-600 p-3 font-mono text-xs overflow-auto">
        <div className="text-pink-400">status<span className="text-white"> = </span><span className="text-yellow-300">'active'</span></div>
        <div className="text-white mt-1"><span className="text-blue-400">AND</span> <span className="text-pink-400">created_at</span> &gt; <span className="text-yellow-300">'2023-01-01'</span></div>
        <div className="text-green-600 mt-2">// Keep only new active users</div>
      </div>
    </div>
    <div className="mt-4">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase">Output Schema</h3>
        <p className="text-[10px] text-gray-500">Same as input</p>
    </div>
  </>
);

const JoinTypeButton = memo(({ icon, label, active }: JoinTypeButtonProps) => (
  <button className={`flex-1 flex flex-col items-center justify-center p-2 border rounded-md gap-1 transition-all ${active ? 'border-primary-600 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-50'}`}>
    <span className={`material-symbols-outlined text-xl ${active ? 'text-primary-600' : ''}`}>{icon}</span>
    <span className={`text-[10px] ${active ? 'font-bold text-primary-600' : ''}`}>{label}</span>
  </button>
));

const SchemaTable = ({ schema }: { schema: DatabaseSchema[] }) => (
  <div className="mt-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase">Output Schema</h3>
      <span className="material-symbols-outlined text-gray-400 text-sm cursor-pointer hover:text-primary-600">refresh</span>
    </div>
    <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden max-h-40 overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase">Field</th>
            <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {schema.length > 0 ? (
             schema[0].columns.map(col => (
                <tr key={col.name}>
                    <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white flex items-center gap-1">
                        {col.key && <span className="text-[8px] text-yellow-600">PK</span>}
                        {col.name}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-500 font-mono">{col.type}</td>
                </tr>
             ))
          ) : (
            <>
                <tr>
                    <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white">sale_id</td>
                    <td className="px-3 py-1.5 text-xs text-gray-500 font-mono">INT</td>
                </tr>
                <tr>
                    <td className="px-3 py-1.5 text-xs text-gray-900 dark:text-white">email</td>
                    <td className="px-3 py-1.5 text-xs text-gray-500 font-mono">VARCHAR</td>
                </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
